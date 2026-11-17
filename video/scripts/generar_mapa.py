"""Genera el mapa real de la esquina de Bichos para el video.

Lee datos de OpenStreetMap (descargados con la API de Overpass) y los convierte
a trazos SVG con el estilo del video: calles, avenidas, plazas, río, edificios,
nombres de calles y la ruta hasta el local.

Uso:
    python3 scripts/generar_mapa.py datos_osm.json src/comun/mapa-real.json

Datos: © colaboradores de OpenStreetMap (licencia ODbL).
"""

import heapq
import json
import math
import sys

MUNDO = 3000  # tamaño del lienzo en píxeles
PX_POR_METRO = 1.2
CALLE_1 = 'Garibaldi'
CALLE_2 = 'Sáenz Peña'


def es_calle(nombre, buscada):
    n = (nombre or '').lower().replace('á', 'a').replace('ñ', 'n')
    b = buscada.lower().replace('á', 'a').replace('ñ', 'n')
    return b in n


def main(entrada, salida):
    datos = json.load(open(entrada, encoding='utf-8'))
    ways = [e for e in datos['elements'] if e['type'] == 'way' and 'geometry' in e]

    # 1) Encontrar la esquina: nodo compartido entre Garibaldi y Sáenz Peña
    def nodos(w):
        return {n: (p['lat'], p['lon']) for n, p in zip(w['nodes'], w['geometry'])}

    g = {}
    s = {}
    for w in ways:
        nombre = w.get('tags', {}).get('name', '')
        if 'highway' not in w.get('tags', {}):
            continue
        if es_calle(nombre, CALLE_1):
            g.update(nodos(w))
        if es_calle(nombre, CALLE_2):
            s.update(nodos(w))
    comunes = set(g) & set(s)
    if not comunes:
        raise SystemExit('No encontré la esquina Garibaldi y Sáenz Peña en los datos')
    esquina_id = sorted(comunes)[0]
    lat0, lon0 = g[esquina_id]
    print('Esquina:', esquina_id, lat0, lon0)

    k_lon = 111320 * math.cos(math.radians(lat0))
    k_lat = 110540

    def xy(lat, lon):
        return (
            MUNDO / 2 + (lon - lon0) * k_lon * PX_POR_METRO,
            MUNDO / 2 - (lat - lat0) * k_lat * PX_POR_METRO,
        )

    def trazo(puntos, cerrar=False):
        d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in puntos)
        return d + (' Z' if cerrar else '')

    def dentro(puntos, margen=600):
        return any(-margen < x < MUNDO + margen and -margen < y < MUNDO + margen for x, y in puntos)

    capas = {k: [] for k in ['verde', 'agua', 'rio', 'edificio', 'tren', 'servicio', 'calle', 'avenida', 'destacada']}
    etiquetas = []
    grafo = {}
    pos = {}

    largo_por_nombre = {}
    for w in ways:
        t = w.get('tags', {})
        puntos = [xy(p['lat'], p['lon']) for p in w['geometry']]
        if not dentro(puntos):
            continue
        cerrado = w['nodes'][0] == w['nodes'][-1]
        hw = t.get('highway')
        if t.get('leisure') in ('park', 'pitch', 'playground', 'garden') or t.get('landuse') in ('grass', 'recreation_ground', 'village_green', 'meadow'):
            if cerrado:
                capas['verde'].append(trazo(puntos, True))
        elif t.get('natural') == 'water' or t.get('water') or t.get('waterway') == 'riverbank':
            if cerrado:
                capas['agua'].append(trazo(puntos, True))
        elif t.get('waterway') in ('river', 'stream', 'canal'):
            capas['rio'].append(trazo(puntos))
        elif 'building' in t:
            if cerrado:
                capas['edificio'].append(trazo(puntos, True))
        elif t.get('railway') == 'rail':
            capas['tren'].append(trazo(puntos))
        elif hw in ('primary', 'secondary', 'tertiary', 'trunk', 'primary_link', 'secondary_link', 'tertiary_link',
                    'residential', 'unclassified', 'living_street', 'service', 'road'):
            nombre = t.get('name', '')
            if es_calle(nombre, CALLE_1) or es_calle(nombre, CALLE_2):
                capas['destacada'].append(trazo(puntos))
            elif hw in ('primary', 'secondary', 'trunk', 'primary_link', 'secondary_link'):
                capas['avenida'].append(trazo(puntos))
            elif hw == 'service':
                capas['servicio'].append(trazo(puntos))
            else:
                capas['calle'].append(trazo(puntos))
            # Grafo para calcular la ruta
            if hw != 'service':
                for n, p in zip(w['nodes'], puntos):
                    pos[n] = p
                for a, b in zip(w['nodes'], w['nodes'][1:]):
                    d = math.dist(pos[a], pos[b])
                    grafo.setdefault(a, []).append((b, d))
                    grafo.setdefault(b, []).append((a, d))
            # Etiquetas: el tramo más largo cerca del centro de cada calle
            if nombre:
                cerca = [p for p in puntos if math.dist(p, (MUNDO / 2, MUNDO / 2)) < 900]
                if len(cerca) >= 2:
                    largo = sum(math.dist(a, b) for a, b in zip(cerca, cerca[1:]))
                    if largo > largo_por_nombre.get(nombre, (0, None))[0]:
                        if cerca[-1][0] < cerca[0][0]:
                            cerca = cerca[::-1]  # que el texto no quede al revés
                        largo_por_nombre[nombre] = (largo, cerca)

    for nombre, (largo, puntos) in largo_por_nombre.items():
        if largo > 160:
            etiquetas.append({'nombre': nombre, 'd': trazo(puntos), 'largo': round(largo)})

    # 2) Ruta: desde un punto unas cuadras al sudoeste hasta la esquina
    objetivo = (MUNDO / 2 - 380, MUNDO / 2 + 300)
    inicio = min(pos, key=lambda n: math.dist(pos[n], objetivo))
    dist = {inicio: 0}
    previo = {}
    cola = [(0, inicio)]
    while cola:
        d, n = heapq.heappop(cola)
        if n == esquina_id:
            break
        if d > dist.get(n, math.inf):
            continue
        for m, c in grafo.get(n, []):
            nd = d + c
            if nd < dist.get(m, math.inf):
                dist[m] = nd
                previo[m] = n
                heapq.heappush(cola, (nd, m))
    camino = [esquina_id]
    while camino[-1] != inicio:
        camino.append(previo[camino[-1]])
    camino.reverse()
    ruta = [pos[n] for n in camino]
    largo_ruta = sum(math.dist(a, b) for a, b in zip(ruta, ruta[1:]))

    salida_json = {
        'fuente': '© colaboradores de OpenStreetMap',
        'mundo': MUNDO,
        'esquina': {'x': MUNDO / 2, 'y': MUNDO / 2, 'lat': lat0, 'lon': lon0},
        'capas': capas,
        'etiquetas': etiquetas,
        'ruta': {'d': trazo(ruta), 'largo': round(largo_ruta, 1), 'inicio': {'x': ruta[0][0], 'y': ruta[0][1]}},
    }
    json.dump(salida_json, open(salida, 'w', encoding='utf-8'), ensure_ascii=False)
    print('Capas:', {k: len(v) for k, v in capas.items()}, 'etiquetas:', len(etiquetas), 'ruta px:', round(largo_ruta))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
