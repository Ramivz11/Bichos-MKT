import React from 'react';
import datos from './mapa-real.json';
import {fontFamily} from './marca';

// Mapa real de la esquina Garibaldi y Roque Sáenz Peña (Río Tercero).
// Las calles, plazas y el río salen de OpenStreetMap (© colaboradores de OpenStreetMap).
// Las casas y los árboles se ubican solos a lo largo de las cuadras reales
// (ver scripts/generar_mapa.py). Todo es generado, así que no se edita pieza por pieza en Studio.

type Casa = [number, number, number, number, number, number, number, number];
type Arbol = [number, number, number, number];

export const MUNDO = datos.mundo;
export const LOCAL = {x: datos.esquina.x, y: datos.esquina.y};
// Giro para que Garibaldi quede horizontal, como se ve en el celular
const GIRO_BASE = datos.giroBase;
const casas = datos.casas as unknown as Casa[];
const arboles = datos.arboles as unknown as Arbol[];

const TECHOS = ['#ece4d8', '#e3d9cb', '#f1ebe1', '#dd9572', '#d8cdbf'];
const PARED_CLARA = '#f7f3ec';
const PARED_OSCURA = '#d9d0c2';

// ---------- Plano del suelo (SVG) ----------
const MapaBase = React.memo(() => {
	const c = datos.capas;
	return (
		<svg width={MUNDO} height={MUNDO} viewBox={`0 0 ${MUNDO} ${MUNDO}`} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				{datos.etiquetas.map((e, i) => (
					<path key={e.nombre} id={`calle-${i}`} d={e.d} />
				))}
			</defs>
			<rect width={MUNDO} height={MUNDO} fill="#ece8df" />
			{c.verde.map((d, i) => (
				<path key={`v${i}`} d={d} fill="#c5e5c0" />
			))}
			{c.agua.map((d, i) => (
				<path key={`a${i}`} d={d} fill="#a9d3f5" />
			))}
			{c.rio.map((d, i) => (
				<path key={`r${i}`} d={d} stroke="#a9d3f5" strokeWidth={60} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{/* Casas lejanas y huella de las cercanas (vistas desde arriba) */}
			{casas.map(([x, y, w, h, ang, , color], i) => (
				<rect key={`c${i}`} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={1.5} fill={TECHOS[color]} stroke="#d6cdbf" strokeWidth={1} transform={`rotate(${ang} ${x} ${y})`} />
			))}
			{c.tren.map((d, i) => (
				<path key={`t${i}`} d={d} stroke="#b9b3aa" strokeWidth={6} fill="none" strokeDasharray="14 8" />
			))}
			{c.servicio.map((d, i) => (
				<path key={`s${i}`} d={d} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
			))}
			{c.calle.map((d, i) => (
				<path key={`cb${i}`} d={d} stroke="#d7d1c5" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{c.avenida.map((d, i) => (
				<path key={`ab${i}`} d={d} stroke="#efc76a" strokeWidth={38} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{c.destacada.map((d, i) => (
				<path key={`db${i}`} d={d} stroke="#efc76a" strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{c.calle.map((d, i) => (
				<path key={`cf${i}`} d={d} stroke="#ffffff" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{c.avenida.map((d, i) => (
				<path key={`af${i}`} d={d} stroke="#fde39a" strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{c.destacada.map((d, i) => (
				<path key={`df${i}`} d={d} stroke="#fde39a" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{/* Árboles lejanos vistos desde arriba */}
			{arboles
				.filter((a) => !a[3])
				.map(([x, y, s], i) => (
					<circle key={`ar${i}`} cx={x} cy={y} r={s * 0.6} fill="#8fcb8c" stroke="#73b673" strokeWidth={1.5} />
				))}
			{datos.etiquetas.map((e, i) => (
				<text key={e.nombre} fontSize={20} fontWeight={600} fill="#5f5a50" fontFamily={fontFamily} stroke="#ffffff" strokeWidth={5} paintOrder="stroke" dy={7}>
					<textPath href={`#calle-${i}`} startOffset="50%" textAnchor="middle">
						{e.nombre}
					</textPath>
				</text>
			))}
		</svg>
	);
});

// ---------- Ruta hasta Bichos ----------
const Ruta = ({recorrido}: {readonly recorrido: number}) => (
	<svg width={MUNDO} height={MUNDO} viewBox={`0 0 ${MUNDO} ${MUNDO}`} style={{position: 'absolute', left: 0, top: 0}}>
		<path d={datos.ruta.d} opacity={recorrido > 0.001 ? 1 : 0} stroke="#1a56c4" strokeWidth={20} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={datos.ruta.largo} strokeDashoffset={datos.ruta.largo * (1 - recorrido)} />
		<path d={datos.ruta.d} opacity={recorrido > 0.001 ? 1 : 0} stroke="#4c8df6" strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={datos.ruta.largo} strokeDashoffset={datos.ruta.largo * (1 - recorrido)} />
		<circle cx={datos.ruta.inicio.x} cy={datos.ruta.inicio.y} r={44} fill="#4c8df6" opacity={0.18} />
		<circle cx={datos.ruta.inicio.x} cy={datos.ruta.inicio.y} r={16} fill="#4c8df6" stroke="#fff" strokeWidth={5} />
	</svg>
);

// ---------- Casas y árboles con volumen (CSS 3D) ----------
const cara = (estilo: React.CSSProperties): React.CSSProperties => ({position: 'absolute', ...estilo});

const Casa3D = ({x, y, w, d, ang, h, color}: {x: number; y: number; w: number; d: number; ang: number; h: number; color: number}) => (
	<div style={{position: 'absolute', left: x, top: y, transformStyle: 'preserve-3d', transform: `rotateZ(${ang}deg)`}}>
		<div style={cara({left: -w / 2, top: d / 2, width: w, height: h, background: PARED_OSCURA, transformOrigin: 'top', transform: 'rotateX(90deg)'})} />
		<div style={cara({left: -w / 2, top: -d / 2 - h, width: w, height: h, background: PARED_CLARA, transformOrigin: 'bottom', transform: 'rotateX(-90deg)'})} />
		<div style={cara({left: w / 2, top: -d / 2, width: h, height: d, background: PARED_CLARA, transformOrigin: 'left', transform: 'rotateY(-90deg)'})} />
		<div style={cara({left: -w / 2 - h, top: -d / 2, width: h, height: d, background: PARED_OSCURA, transformOrigin: 'right', transform: 'rotateY(90deg)'})} />
		<div style={cara({left: -w / 2, top: -d / 2, width: w, height: d, background: TECHOS[color], border: '1px solid rgba(0,0,0,0.08)', boxSizing: 'border-box', transform: `translateZ(${h}px)`})} />
	</div>
);

const silueta =
	'radial-gradient(circle at 50% 66%, #76bd77 0 34%, transparent 35%), linear-gradient(to right, transparent 46%, #8a6a4a 46% 54%, transparent 54%)';

const Arbol3D = ({x, y, s}: {x: number; y: number; s: number}) => {
	const alto = s * 2.2;
	return (
		<div style={{position: 'absolute', left: x, top: y, transformStyle: 'preserve-3d'}}>
			<div style={cara({left: -s * 0.7, top: -s * 0.35, width: s * 1.4, height: s * 0.7, borderRadius: '50%', background: 'rgba(60,70,40,0.18)'})} />
			<div style={cara({left: -s, top: 0, width: s * 2, height: alto, background: silueta, transformOrigin: 'top', transform: 'rotateX(90deg)'})} />
			<div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: 'rotateZ(90deg)'}}>
				<div style={cara({left: -s, top: 0, width: s * 2, height: alto, background: silueta, transformOrigin: 'top', transform: 'rotateX(90deg)'})} />
			</div>
			<div style={cara({left: -s * 0.75, top: -s * 0.75, width: s * 1.5, height: s * 1.5, borderRadius: '50%', background: '#82c582', border: '1.5px solid #66ad68', boxSizing: 'border-box', transform: `translateZ(${alto * 0.66}px)`})} />
		</div>
	);
};

const Objetos3D = React.memo(() => (
	<>
		{casas
			.filter((c) => c[7])
			.map(([x, y, w, d, ang, h, color], i) => (
				 
				<Casa3D key={`c${i}`} x={x} y={y} w={w} d={d} ang={ang} h={h} color={color} />
			))}
		{arboles
			.filter((a) => a[3])
			.map(([x, y, s], i) => (
				 
				<Arbol3D key={`a${i}`} x={x} y={y} s={s} />
			))}
	</>
));

// Cámara: centra la esquina de Bichos en (cx, cy) de la pantalla, con zoom, giro e inclinación 3D.
export const Camara = ({
	cx,
	cy,
	zoom,
	giro,
	inclinacion,
	desenfoque = 0,
	recorrido,
	en3d = true,
}: {
	readonly cx: number;
	readonly cy: number;
	readonly zoom: number;
	readonly giro: number;
	readonly inclinacion: number;
	readonly desenfoque?: number;
	readonly recorrido: number;
	readonly en3d?: boolean;
}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			perspective: 1400,
			perspectiveOrigin: `${cx}px ${cy}px`,
			backgroundColor: '#ece8df',
			filter: desenfoque > 0.2 ? `blur(${desenfoque}px)` : undefined,
		}}
	>
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: MUNDO,
				height: MUNDO,
				transformOrigin: '0 0',
				transformStyle: 'preserve-3d',
				transform: `translate(${cx}px, ${cy}px) rotateX(${inclinacion}deg) rotateZ(${giro + GIRO_BASE}deg) scale(${zoom}) translate(${-LOCAL.x}px, ${-LOCAL.y}px)`,
			}}
		>
			<MapaBase />
			<Ruta recorrido={recorrido} />
			{en3d ? <Objetos3D /> : null}
		</div>
	</div>
);
