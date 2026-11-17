"""Genera el mapa real de la esquina de Bichos para el video.

Lee datos de OpenStreetMap (API oficial o Overpass) y los convierte
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
REFERENCIA_ARRIBA = 'Marin Maroto'  # calle que en el celular se ve arriba del local


def es_calle(nombre, buscada):
    n = (nombre or '').lower().replace('á', 'a').replace('ñ', 'n')
    b = buscada.lower().replace('á', 'a').replace('ñ', 'n')
    return b in n


def main(entrada, salida):
    datos = json.load(open(entrada, encoding='utf-8'))
    # Acepta el formato de Overpass ("out geom") o el de la API oficial (/api/0.6/map.json)
    coords = {e['id']: (e['lat'], e['lon']) for e in datos['elements'] if e['type'] == 'node'}
    for e in datos['elements']:
        if e['type'] == 'way' and 'geometry' not in e and all(n in coords for n in e.get('nodes', [])):
            e['geometry'] = [{'lat': coords[n][0], 'lon': coords[n][1]} for n in e['nodes']]
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

    # Giro base: orientar el mapa como en el celular (Google Maps del local):
    # la calle que cruza Marín Maroto queda vertical, con Marín Maroto arriba.
    giro_base = 0.0
    nodos_ref = {}
    for w in ways:
        t = w.get('tags', {})
        if 'highway' in t and es_calle(t.get('name', ''), REFERENCIA_ARRIBA):
            nodos_ref.update(nodos(w))
    candidatos = [n for n in nodos_ref if n in g]
    if candidatos:
        ref = min(candidatos, key=lambda n: math.dist(xy(*g[n]), (MUNDO / 2, MUNDO / 2)))
        rx, ry = xy(*g[ref])
        ang = math.degrees(math.atan2(ry - MUNDO / 2, rx - MUNDO / 2))
        giro_base = round(((-90 - ang + 180) % 360) - 180, 1)
    print('Giro base:', giro_base)
    cos_g, sin_g = math.cos(math.radians(giro_base)), math.sin(math.radians(giro_base))

    capas = {k: [] for k in ['verde', 'agua', 'rio', 'edificio', 'tren', 'servicio', 'calle', 'avenida', 'destacada']}
    segmentos = []  # tramos de calle (x1, y1, x2, y2, ancho)
    obstaculos = []  # tramos de río y tren
    poligonos_verdes = []
    poligonos_agua = []
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
                poligonos_verdes.append(puntos)
        elif t.get('natural') == 'water' or t.get('water') or t.get('waterway') == 'riverbank':
            if cerrado:
                capas['agua'].append(trazo(puntos, True))
                poligonos_agua.append(puntos)
        elif t.get('waterway') in ('river', 'stream', 'canal'):
            capas['rio'].append(trazo(puntos))
            obstaculos += [(a[0], a[1], b[0], b[1], 40) for a, b in zip(puntos, puntos[1:])]
        elif 'building' in t:
            if cerrado:
                capas['edificio'].append(trazo(puntos, True))
        elif t.get('railway') == 'rail':
            capas['tren'].append(trazo(puntos))
            obstaculos += [(a[0], a[1], b[0], b[1], 8) for a, b in zip(puntos, puntos[1:])]
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
            ancho = 6 if hw == 'service' else (17 if hw in ('primary', 'secondary', 'trunk') else 11)
            segmentos += [(a[0], a[1], b[0], b[1], ancho) for a, b in zip(puntos, puntos[1:])]
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
                        dx = cerca[-1][0] - cerca[0][0]
                        dy = cerca[-1][1] - cerca[0][1]
                        if dx * cos_g - dy * sin_g < 0:
                            cerca = cerca[::-1]  # que el texto no quede al revés en pantalla
                        largo_por_nombre[nombre] = (largo, cerca)

    for nombre, (largo, puntos) in largo_por_nombre.items():
        if largo > 160:
            etiquetas.append({'nombre': nombre, 'd': trazo(puntos), 'largo': round(largo)})

    # 2) Ruta: desde unas cuadras de distancia hasta la esquina
    # punto de partida: abajo a la izquierda en pantalla (ya girada), para que la ruta llegue de frente
    sx, sy = -150, 420
    objetivo = (MUNDO / 2 + sx * cos_g + sy * sin_g, MUNDO / 2 - sx * sin_g + sy * cos_g)
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

    casas, arboles = poblar(segmentos, obstaculos, poligonos_verdes, poligonos_agua)



    salida_json = {
        'fuente': '© colaboradores de OpenStreetMap',
        'mundo': MUNDO,
        'giroBase': giro_base,
        'esquina': {'x': MUNDO / 2, 'y': MUNDO / 2, 'lat': lat0, 'lon': lon0},
        'capas': capas,
        'etiquetas': etiquetas,
        'ruta': {'d': trazo(ruta), 'largo': round(largo_ruta, 1), 'inicio': {'x': ruta[0][0], 'y': ruta[0][1]}},
        # casas: [x, y, frente, fondo, ángulo°, alto, color, 3d]  árboles: [x, y, tamaño, 3d]
        'casas': casas,
        'arboles': arboles,
    }
    json.dump(salida_json, open(salida, 'w', encoding='utf-8'), ensure_ascii=False)
    print('Capas:', {k: len(v) for k, v in capas.items()}, 'etiquetas:', len(etiquetas), 'ruta px:', round(largo_ruta))
    print('Casas:', len(casas), '(3D:', sum(c[7] for c in casas), ') Árboles:', len(arboles), '(3D:', sum(a[3] for a in arboles), ')')


RADIO_3D = 430  # alrededor de la esquina, casas y árboles con volumen
RADIO_TOTAL = 1250


def dist_segmento(px, py, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    l2 = dx * dx + dy * dy
    t = 0 if l2 == 0 else max(0, min(1, ((px - x1) * dx + (py - y1) * dy) / l2))
    return math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))


def dentro_poligono(x, y, pol):
    adentro = False
    j = len(pol) - 1
    for i in range(len(pol)):
        xi, yi = pol[i]
        xj, yj = pol[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi:
            adentro = not adentro
        j = i
    return adentro


def poblar(segmentos, obstaculos, verdes, agua):
    """Casas a lo largo de cada cuadra y árboles en veredas y plazas (posiciones fijas)."""
    rnd = __import__('random').Random(5)
    celda = 80
    grilla = {}
    for sg in segmentos + obstaculos:
        x1, y1, x2, y2, _ = sg
        for cx in range(int(min(x1, x2) // celda) - 1, int(max(x1, x2) // celda) + 2):
            for cy in range(int(min(y1, y2) // celda) - 1, int(max(y1, y2) // celda) + 2):
                grilla.setdefault((cx, cy), []).append(sg)

    def libre(x, y, margen):
        for sg in grilla.get((int(x // celda), int(y // celda)), []):
            if dist_segmento(x, y, *sg[:4]) < sg[4] + margen:
                return False
        return True

    ocupado = {}

    def choca(x, y, r):
        cx, cy = int(x // 30), int(y // 30)
        for i in range(cx - 1, cx + 2):
            for j in range(cy - 1, cy + 2):
                for (ox, oy, orad) in ocupado.get((i, j), []):
                    if math.hypot(x - ox, y - oy) < r + orad:
                        return True
        return False

    def marcar(x, y, r):
        ocupado.setdefault((int(x // 30), int(y // 30)), []).append((x, y, r))

    def en_zona_especial(x, y):
        return any(dentro_poligono(x, y, p) for p in verdes + agua)

    centro = (MUNDO / 2, MUNDO / 2)
    casas, arboles = [], []
    for (x1, y1, x2, y2, ancho) in segmentos:
        if ancho < 8:
            continue
        largo = math.hypot(x2 - x1, y2 - y1)
        if largo < 20:
            continue
        ux, uy = (x2 - x1) / largo, (y2 - y1) / largo
        nx, ny = -uy, ux
        ang = math.degrees(math.atan2(uy, ux))
        for lado in (-1, 1):
            t = 10 + rnd.random() * 6
            while t < largo - 10:
                frente = 11 + rnd.random() * 5
                fondo = 18 + rnd.random() * 12
                off = ancho + 7 + fondo / 2
                x = x1 + ux * t + nx * off * lado
                y = y1 + uy * t + ny * off * lado
                r = max(frente, fondo) * 0.5
                d = math.dist((x, y), centro)
                if d < RADIO_TOTAL and libre(x, y, fondo / 2 + 2) and not choca(x, y, r) and not en_zona_especial(x, y):
                    alto = 8 + rnd.random() * 7 if rnd.random() > 0.15 else 17 + rnd.random() * 12
                    casas.append([round(x, 1), round(y, 1), round(frente, 1), round(fondo, 1), round(ang, 1), round(alto, 1), rnd.randrange(5), int(d < RADIO_3D)])
                    marcar(x, y, r)
                # árbol en la vereda
                if rnd.random() < 0.3:
                    tx = x1 + ux * (t + frente / 2) + nx * (ancho + 4) * lado
                    ty = y1 + uy * (t + frente / 2) + ny * (ancho + 4) * lado
                    dd = math.dist((tx, ty), centro)
                    if dd < RADIO_TOTAL and libre(tx, ty, 2) and not choca(tx, ty, 4):
                        arboles.append([round(tx, 1), round(ty, 1), round(7 + rnd.random() * 4, 1), int(dd < RADIO_3D)])
                        marcar(tx, ty, 4)
                t += frente + 1.5
    # árboles en plazas
    for pol in verdes:
        xs = [p[0] for p in pol]
        ys = [p[1] for p in pol]
        area = (max(xs) - min(xs)) * (max(ys) - min(ys))
        for _ in range(int(area / 450)):
            x = min(xs) + rnd.random() * (max(xs) - min(xs))
            y = min(ys) + rnd.random() * (max(ys) - min(ys))
            dd = math.dist((x, y), centro)
            if dd < RADIO_TOTAL and dentro_poligono(x, y, pol) and libre(x, y, 3) and not choca(x, y, 7):
                arboles.append([round(x, 1), round(y, 1), round(9 + rnd.random() * 6, 1), int(dd < RADIO_3D)])
                marcar(x, y, 7)
    return casas, arboles


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
