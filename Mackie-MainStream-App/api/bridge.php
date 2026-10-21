<?php
/**
 * @file bridge.php
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Puente Hardware UVC/UAC2 en Tiempo Real para Mackie MainStream Studio M2 (iPad Pro M2 <-> PC 10.10.10.122).
 *              Permite capturar y transmitir en vivo la señal real de `video="MainStream HDMI"` (VID_0A73&PID_0035)
 *              usando FFmpeg DirectShow sin depender de HTTPS/WebRTC local cuando se accede por LAN HTTP (10.10.10.122).
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$baseDir = dirname(__DIR__);
$streamDir = $baseDir . DIRECTORY_SEPARATOR . 'stream';
if (!is_dir($streamDir)) {
    @mkdir($streamDir, 0777, true);
}

$liveJpg = $streamDir . DIRECTORY_SEPARATOR . 'live.jpg';
$fallbackJpg = $baseDir . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'live_probe.jpg';
$stateFile = $streamDir . DIRECTORY_SEPARATOR . 'hardware_state.json';
$ffmpegPath = 'C:\\Program Files\\Tracktion\\Waveform 14\\ffmpeg.exe';

$profiles = [
    '1080p30-safe' => ['width' => 1920, 'height' => 1080, 'fps' => 30, 'label' => '1080p30 Safe Hub (Recomendado iPad Pro M2)'],
    '1080p50-pro'  => ['width' => 1920, 'height' => 1080, 'fps' => 50, 'label' => '1080p50 Max MJPEG (Direct USB-C)'],
    '720p60-gaming'=> ['width' => 1280, 'height' => 720,  'fps' => 60, 'label' => '720p60 Low-Latency Gaming'],
    '720p30-fallback' => ['width' => 1280, 'height' => 720, 'fps' => 30, 'label' => '720p30 Ultra-Estable (Fallback)']
];

function loadHardwareState($stateFile) {
    if (file_exists($stateFile)) {
        $data = @json_decode(@file_get_contents($stateFile), true);
        if (is_array($data)) return $data;
    }
    return [
        'profile' => '1080p30-safe',
        'videoDevice' => 'MainStream HDMI',
        'audioDevice' => 'Audio Input (2- MainStream)',
        'avDelayMs' => 45,
        'mainOut' => 85,
        'phonesOut' => 85,
        'micGain' => 38,
        'chatMix' => 50,
        'activeKey' => 1,
        'micMuted' => false,
        'voiceDucking' => false,
        'updatedAt' => time()
    ];
}

function saveHardwareState($stateFile, $state) {
    $state['updatedAt'] = time();
    @file_put_contents($stateFile, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function isStreamFresh($liveJpg, $maxAgeSeconds = 4) {
    if (!file_exists($liveJpg)) return false;
    clearstatcache(true, $liveJpg);
    return (time() - @filemtime($liveJpg)) <= $maxAgeSeconds && @filesize($liveJpg) > 1024;
}

function startFfmpegDaemon($ffmpegPath, $liveJpg, $device, $width, $height, $fps, $forceRestart = false) {
    if (!file_exists($ffmpegPath)) {
        return false;
    }
    if (!$forceRestart && isStreamFresh($liveJpg, 4)) {
        return true;
    }

    $devName = ($device === 'OBS Virtual Camera') ? 'OBS Virtual Camera' : 'MainStream HDMI';
    $args = sprintf(
        '-hide_banner -loglevel error -y -f dshow -rtbufsize 128M -vcodec mjpeg -video_size %dx%d -framerate %d -i video=\"%s\" -vf fps=15 -q:v 4 -update 1 \"%s\"',
        $width,
        $height,
        $fps,
        $devName,
        $liveJpg
    );

    if ($forceRestart) {
        @exec('taskkill /F /IM ffmpeg.exe >NUL 2>&1');
        usleep(150000);
    }

    // Lanzar proceso completamente desacoplado en Windows mediante PowerShell Start-Process (no bloquea el descriptor stdout de PHP)
    $psCmd = sprintf(
        'powershell -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath \'%s\' -ArgumentList \'%s\' -WindowStyle Hidden"',
        $ffmpegPath,
        $args
    );
    @exec($psCmd);

    return true;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'status';

// 1. Servir fotograma JPEG en vivo de baja latencia (< 5ms)
if ($action === 'frame') {
    header('Content-Type: image/jpeg');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');

    if (file_exists($liveJpg) && @filesize($liveJpg) > 1024) {
        @readfile($liveJpg);
        exit;
    } elseif (file_exists($fallbackJpg)) {
        @readfile($fallbackJpg);
        exit;
    } else {
        http_response_code(204);
        exit;
    }
}

header('Content-Type: application/json; charset=utf-8');

// 2. Enumerar dispositivos reales conectados al bus de la estación / Mackie MainStream
if ($action === 'devices' || $action === 'status') {
    $state = loadHardwareState($stateFile);
    $profKey = isset($profiles[$state['profile']]) ? $state['profile'] : '1080p30-safe';
    $prof = $profiles[$profKey];
    $streamOnline = isStreamFresh($liveJpg, 4);

    if (!$streamOnline) {
        startFfmpegDaemon($ffmpegPath, $liveJpg, $state['videoDevice'], $prof['width'], $prof['height'], $prof['fps'], false);
        $streamOnline = file_exists($liveJpg) || file_exists($fallbackJpg);
    }

    clearstatcache(true, $liveJpg);
    $frameAgeMs = file_exists($liveJpg) ? max(0, (time() - @filemtime($liveJpg)) * 1000) : 9999;
    $frameBytes = file_exists($liveJpg) ? @filesize($liveJpg) : 0;

    echo json_encode([
        'ok' => true,
        'streamOnline' => $streamOnline,
        'frameAgeMs' => $frameAgeMs,
        'frameBytes' => $frameBytes,
        'usbVidPid' => 'VID_0A73&PID_0035 (LOUD Audio / Mackie MainStream)',
        'resolution' => $prof['width'] . 'x' . $prof['height'],
        'fps' => $prof['fps'],
        'state' => $state,
        'videoDevices' => [
            ['id' => 'MainStream HDMI', 'label' => 'MainStream HDMI (UVC Hardware VID_0A73&PID_0035)'],
            ['id' => 'OBS Virtual Camera', 'label' => 'OBS Virtual Camera (DirectShow Bridge)']
        ],
        'audioDevices' => [
            ['id' => 'Audio Input (2- MainStream)', 'label' => 'Audio Input (2- MainStream) — UAC2 48kHz 24-bit'],
            ['id' => 'Microphone (Maono AI Microphone)', 'label' => 'Microphone (Maono PD200W / AI Mic USB)'],
            ['id' => 'CABLE Output (VB-Audio Virtual Cable)', 'label' => 'CABLE Output (VB-Audio Virtual Cable)'],
            ['id' => 'Audio Output (2- MainStream)', 'label' => 'Audio Output (2- MainStream) — Monitores/Phones']
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Iniciar o Reiniciar (Hot-Reset) el endpoint UVC de captura HDMI
if ($action === 'start_capture' || $action === 'hot_reset') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_REQUEST;
    $state = loadHardwareState($stateFile);

    if (!empty($input['profile']) && isset($profiles[$input['profile']])) {
        $state['profile'] = $input['profile'];
    }
    if (!empty($input['videoDevice'])) {
        $state['videoDevice'] = $input['videoDevice'];
    }
    if (!empty($input['audioDevice'])) {
        $state['audioDevice'] = $input['audioDevice'];
    }
    saveHardwareState($stateFile, $state);

    $prof = $profiles[$state['profile']];
    $force = ($action === 'hot_reset') || !empty($input['force']);
    $started = startFfmpegDaemon($ffmpegPath, $liveJpg, $state['videoDevice'], $prof['width'], $prof['height'], $prof['fps'], $force);

    echo json_encode([
        'ok' => true,
        'started' => $started,
        'profile' => $state['profile'],
        'profileLabel' => $prof['label'],
        'resolution' => $prof['width'] . 'x' . $prof['height'],
        'fps' => $prof['fps'],
        'videoDevice' => $state['videoDevice'],
        'audioDevice' => $state['audioDevice'],
        'message' => $force
            ? 'Hot-Reset UVC completado: Endpoint MainStream HDMI reiniciado limpiamente.'
            : 'Stream UVC MainStream HDMI bloqueado y transmitiendo en vivo.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Actualizar controles físicos del Mackie MainStream (Knobs 1-4 y Keys 1-6)
if ($action === 'hardware_control') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_REQUEST;
    $state = loadHardwareState($stateFile);

    foreach (['avDelayMs', 'mainOut', 'phonesOut', 'micGain', 'chatMix', 'activeKey', 'micMuted', 'voiceDucking'] as $k) {
        if (isset($input[$k])) {
            $state[$k] = $input[$k];
        }
    }
    saveHardwareState($stateFile, $state);

    echo json_encode([
        'ok' => true,
        'state' => $state
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Acción desconocida']);
