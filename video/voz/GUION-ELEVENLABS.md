# Voz en off para ElevenLabs · Reel de Bichos

## 1. Crear la voz (Voice Design)

En ElevenLabs: **Voices → Create a Voice → Voice Design**. Pegá esta descripción:

```
Voz femenina joven, de 25 a 30 años, argentina con acento rioplatense natural (voseo).
Tono cálido, cercano y entusiasta, como una creadora de contenido contándole un
descubrimiento a una amiga. Sonrisa en la voz, ritmo ágil pero claro, nada de locutor
de radio ni tono publicitario exagerado. Grabación limpia de estudio, sin eco ni música.
```

Texto de prueba para escuchar las opciones:

```
¿Dónde compro lo mejor para mi mascota? Le preguntamos a la IA… ¡y no dudó!
```

> Variante local: si querés que suene bien de la zona, cambiá "acento rioplatense natural"
> por "tonada cordobesa suave y simpática, sin exagerar".

## 2. Guion (Text to Speech)

Modelo recomendado: **Eleven v3**, que entiende las etiquetas entre corchetes.
Generá **cada línea por separado** y descargala con el número del nombre (01.mp3, 02.mp3…).
Así cada frase se ubica justo en su escena.

| Archivo | Entra en | Escena | Texto para pegar |
|---|---|---|---|
| `01.mp3` | 0,2 s | Gancho | `[curious] ¿Dónde compro lo mejor para mi mascota?` |
| `02.mp3` | 2,8 s | Chat con la IA | `Le preguntamos a la IA… [excited] ¡y no dudó: Bichos!` |
| `03.mp3` | 8,6 s | Mapa | `En Garibaldi y Roque Sáenz Peña, acá nomás, en Río Tercero.` |
| `04.mp3` | 14,4 s | Cierre | `No lo decimos nosotros… [playfully] ¡lo dice la IA!` |
| `05.mp3` | 16,8 s | Cierre | `[warmly] Vení de lunes a sábado. ¡Te esperamos!` |

Entre 12,2 s y 14 s (cuando aparece el local) no hay voz a propósito: ahí se escucha el
sonido del clip y el golpe del portal.

Duración total aproximada: 15 a 16 segundos de voz dentro de un video de 19,6 s.

## 3. Ajustes

| Ajuste | Valor |
|---|---|
| Modelo | Eleven v3 (o Multilingual v2 si no tenés v3) |
| Stability (v3) | **Natural** |
| Stability (v2) | 40 % |
| Similarity (v2) | 75 % |
| Style exaggeration (v2) | 25 % |
| Speaker boost | Activado |
| Velocidad | 1.05 |
| Formato | MP3 44.1 kHz 192 kbps (o WAV) |

Si usás Multilingual v2, sacá las etiquetas entre corchetes del texto: v2 las lee en voz alta.

## 4. Cuando tengas los audios

Pasámelos (arrastralos al chat) y los meto en el video en una pista "Voz" de Remotion.
Ahí bajo automáticamente la música y los efectos mientras habla la voz.
