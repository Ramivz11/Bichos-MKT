# Reel de Bichos en Remotion

Video vertical (1080×1920, 30 fps, 19,6 s) hecho con código usando [Remotion](https://www.remotion.dev).

## Escenas

| # | Archivo | Qué pasa |
|---|---|---|
| 1 | `src/escenas/Gancho.tsx` | "¿Dónde compro lo mejor para mi mascota?" palabra por palabra |
| 2 | `src/escenas/Chat.tsx` | Se tipea la pregunta a la IA, responde y aparece la ubicación |
| 3 | `src/escenas/MapaEscena.tsx` | La tarjeta se abre en el mapa, cae el pin, cámara 3D y zambullida |
| 4 | `src/escenas/Local.tsx` | Portal al clip real del local |
| 5 | `src/escenas/Cierre.tsx` | CTA: "No lo decimos nosotros… lo dice la IA 😉" + dirección y horarios |

Todo se une en `src/BichosReel.tsx` (transiciones, efectos de sonido y beat).
Los archivos (clip, cartel, sonidos y tipografía Inter) están en `public/`.

## Cómo usarlo

```console
npm i                # instalar (una sola vez)
npm run dev          # abrir Remotion Studio para ver y editar el video
npx remotion render BichosReel out/bichos-reel.mp4   # exportar el MP4
```

En Studio podés tocar textos, colores y tiempos de los elementos marcados con nombre
(palabras del gancho, respuesta del chat, textos del cierre, sonidos).
La cámara del mapa y el tipeo se calculan cuadro a cuadro, así que se cambian desde el código.

## Mapa real

El mapa sale de OpenStreetMap (© colaboradores de OpenStreetMap, licencia ODbL).
Para regenerarlo:

```console
curl -o osm.json "https://api.openstreetmap.org/api/0.6/map.json?bbox=-64.14,-32.20,-64.08,-32.15"
python3 scripts/generar_mapa.py osm.json src/comun/mapa-real.json
```

Las casas y los árboles en 3D se ubican solos a lo largo de las cuadras reales.

La música (`public/sfx/musica.wav`) se genera con `python3 scripts/generar_musica.py public/sfx/musica.wav`.

> Remotion es gratis para equipos de hasta 3 personas.
