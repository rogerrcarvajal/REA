<?php
/**
 * @file bridge.php
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Puente en Tiempo Real para Mackie Matrix Console M2 (iPad Pro M2 <-> PC 10.10.10.122).
 *              Sincroniza el estado de los 9 canales x 4 submixes, los presets de EQ de 5 bandas,
 *              el archivo `.mackie` [V2] y sirve el catálogo real de 78 efectos de sonido MP3 de OBS/Mackie.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$baseDir = dirname(__DIR__);
$presetsDir = $baseDir . DIRECTORY_SEPARATOR . 'presets';
$soundsDir = $baseDir . DIRECTORY_SEPARATOR . 'sounds';
$liveStateFile = $presetsDir . DIRECTORY_SEPARATOR . 'live-matrix-state.json';
$liveMackieFile = $presetsDir . DIRECTORY_SEPARATOR . 'MainStream-Config-Backup-V2.mackie';

$action = isset($_GET['action']) ? $_GET['action'] : 'status';

if ($action === 'status') {
    $sounds = [];
    if (is_dir($soundsDir)) {
        foreach (scandir($soundsDir) as $f) {
            if (preg_match('/\.mp3$/i', $f)) {
                $sounds[] = $f;
            }
        }
    }
    $savedState = null;
    if (file_exists($liveStateFile)) {
        $savedState = @json_decode(@file_get_contents($liveStateFile), true);
    }
    echo json_encode([
        'ok' => true,
        'host' => gethostname(),
        'soundCount' => count($sounds),
        'sounds' => $sounds,
        'savedState' => $savedState
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'save_state') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (is_array($input)) {
        if (!empty($input['state'])) {
            @file_put_contents($liveStateFile, json_encode($input['state'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        if (!empty($input['mackieText'])) {
            @file_put_contents($liveMackieFile, $input['mackieText']);
        }
        echo json_encode(['ok' => true, 'savedAt' => date('H:i:s')]);
        exit;
    }
    echo json_encode(['ok' => false, 'error' => 'Payload inválido']);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Acción no reconocida']);
