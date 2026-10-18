# 📄 02. Especificación del Formato de Configuración `.mackie` (`[V1]` y `[V2]`)

**Autor:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
**Archivos Analizados:**  
- `D:\Installers\Mackie Mainstream\Mackie Mainstream - Backup.mackie` (`[V1]`, 392 líneas)  
- `D:\Installers\Mackie Mainstream\MainStream Config\MainStream - Config Backup.mackie` (`[V2]`, 1,254 líneas)

---

## 1. Estructura General (`QSettings::IniFormat`)

Los archivos `.mackie` utilizan el formato INI extendido de **Qt6 `QSettings`**, donde las claves jerárquicas se separan con barra invertida (`\`) y los caracteres especiales en nombres de dispositivos se codifican en URL-encoding (`%20` para espacio, `%28` para `(`, `%29` para `)`, `%3B` para `;`).

### Comparativa entre Esquema `[V1]` y `[V2]`:
- **`[V1]`**: Almacena `channels_current`, `channels_order`, `eq_presets`, `eq_presets_current`, `mixer_presets` y `submixes\0..1`.
- **`[V2]`**: Expande los buses de salida a **4 submixes independientes (`submixes\0..3`)**, añade `mvoice_state` (estado XML VST3 por canal/submix), `sample_settings\A1..D8` (32 pads de samples en 4 bancos) y `vfx_presets_current` (Delay, Reverb, Telephone, Pitch Shift y Robot Voice).

---

## 2. Decodificación de Colores `@Variant(...)` de Qt6

En los archivos `.mackie`, la propiedad `color` se serializa como un objeto `QColor` dentro de `QVariant`:

| Canal / Pad | Literal `@Variant(...)` en `.mackie` | Color Hex Decodificado |
| :--- | :--- | :---: |
| **Main Stream / Samples / A1** | `@Variant(\0\0\0\x43\x1\xff\xff\x9c\x9c\xcc\xccVV\0\0)` | `#9CCC56` (Verde Mackie) |
| **Maono PD 200W / A2** | `@Variant(\0\0\0\x43\x1\xff\xffNN\xb9\xb9ll\0\0)` | `#4EB96C` (Esmeralda) |
| **Audio Auxiliar / A3** | `@Variant(\0\0\0\x43\x1\xff\xff\x85\x85\xcc\xcc\xa9\xa9\0\0)` | `#85CCA9` (Menta) |
| **Game (Virtual input A)** | `@Variant(\0\0\0\x43\x1\xff\xff\xea\xea\x1a\x1a[[\0\0)` | `#EA1A5B` (Rosa Gaming) |
| **Chat (Virtual input B)** | `@Variant(\0\0\0\x43\x1\xff\xff\xf0\xf0XX**\0\0)` | `#F0582A` (Naranja Chat) |
| **Music (Virtual input C)** | `@Variant(\0\0\0\x43\x1\xff\xff\xff\xff\xc9\xc9\t\t\0\0)` | `#FFC909` (Ámbar Música) |
| **Browser (Virtual input D)** | `@Variant(\0\0\0\x43\x1\xff\xff\xa2\xa2vv\xb3\xb3\0\0)` | `#A276B3` (Púrpura) |
| **System (Virtual input E)** | `@Variant(\0\0\0\x43\x1\xff\xff\x64\x64\xcb\xcb\xe5\xe5\0\0)` | `#64CBE5` (Cian Sistema) |

---

## 3. Especificación de las 5 Bandas del EQ Paramétrico (`eq_presets`)

Cada preset en `eq_presets\<Nombre>\bands\1..5\` define:
- `idx`: Índice 0 a 4.
- `mode`:
  - `0`: Filtro Pasa-Altos / Corte de Graves (*High-Pass / Low-Cut*, típicamente en Banda 1 a `39.98 Hz`, `-11.89 dB`).
  - `1`: Filtro *High-Shelf* (típicamente en Banda 5 a `8,199.18 Hz` o `15,000 Hz`, `+7.73 dB`).
  - `2`: Filtro *Peaking Bell* (Bandas 2, 3 y 4 en `80–94 Hz`, `486–838 Hz`, `2,600–3,075 Hz`).
- `freq`: Frecuencia central en Hz (`float`).
- `gain`: Ganancia en dB (`-15.0` a `+15.0`).
- `width`: Ancho de banda (`1.0` o `1.5`).
