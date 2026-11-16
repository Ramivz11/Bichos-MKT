import React, {useMemo} from 'react';
import {fontFamily} from './marca';

// Mapa ilustrado estilo "Maps" (no son las calles reales de Río Tercero).
// Se genera con código: cuadras, calles, plazas, río y la ruta hasta Bichos.
// Es decoración generada, por eso no es editable pieza por pieza en Studio.

export const MUNDO = 3000; // tamaño del mapa en píxeles
const CUADRA = 125;
export const LOCAL = {x: 1500, y: 1500}; // esquina Garibaldi y Roque Sáenz Peña
const RUTA = `M ${7 * CUADRA} ${14 * CUADRA} L ${9 * CUADRA} ${14 * CUADRA} L ${9 * CUADRA} ${LOCAL.y} L ${LOCAL.x} ${LOCAL.y}`;
const LARGO_RUTA = 2 * CUADRA + 2 * CUADRA + 3 * CUADRA;

const azar = (semilla: number) => {
	let s = semilla;
	return () => {
		s = (s * 16807) % 2147483647;
		return s / 2147483647;
	};
};

const Cuadras = React.memo(() => {
	const elementos = useMemo(() => {
		const rnd = azar(7);
		const out: React.ReactNode[] = [];
		const n = MUNDO / CUADRA;
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const x = i * CUADRA + 12;
				const y = j * CUADRA + 12;
				const w = CUADRA - 24;
				if (rnd() < 0.07) {
					out.push(<rect key={`p${i}-${j}`} x={x} y={y} width={w} height={w} rx={6} fill="#c5e5c0" />);
					continue;
				}
				for (let k = 0; k < 4; k++) {
					out.push(
						<rect
							key={`b${i}-${j}-${k}`}
							x={x + 4 + rnd() * w * 0.55}
							y={y + 4 + rnd() * w * 0.55}
							width={18 + rnd() * 34}
							height={18 + rnd() * 34}
							rx={2}
							fill="#e2ddd2"
						/>,
					);
				}
			}
		}
		const calles: React.ReactNode[] = [];
		const bordes: React.ReactNode[] = [];
		for (let i = 0; i <= n; i++) {
			const v = i * CUADRA;
			if (v !== LOCAL.x) {
				bordes.push(<line key={`bv${i}`} x1={v} y1={0} x2={v} y2={MUNDO} stroke="#d7d1c5" strokeWidth={22} />);
				calles.push(<line key={`cv${i}`} x1={v} y1={0} x2={v} y2={MUNDO} stroke="#fff" strokeWidth={18} />);
			}
			if (v !== LOCAL.y) {
				bordes.push(<line key={`bh${i}`} x1={0} y1={v} x2={MUNDO} y2={v} stroke="#d7d1c5" strokeWidth={22} />);
				calles.push(<line key={`ch${i}`} x1={0} y1={v} x2={MUNDO} y2={v} stroke="#fff" strokeWidth={18} />);
			}
		}
		return [...out, ...bordes, ...calles];
	}, []);
	return <>{elementos}</>;
});

const Etiqueta = ({texto, x, y, rot}: {texto: string; x: number; y: number; rot: number}) => (
	<text
		x={x}
		y={y}
		fontSize={22}
		fontWeight={600}
		fill="#6b5a2e"
		fontFamily={fontFamily}
		textAnchor="middle"
		transform={`rotate(${rot} ${x} ${y})`}
		stroke="#fde39a"
		strokeWidth={5}
		paintOrder="stroke"
	>
		{texto}
	</text>
);

export const MapaMundo = ({recorrido}: {readonly recorrido: number}) => (
	<svg width={MUNDO} height={MUNDO} viewBox={`0 0 ${MUNDO} ${MUNDO}`} style={{position: 'absolute', left: 0, top: 0}}>
		<rect width={MUNDO} height={MUNDO} fill="#ece8df" />
		<Cuadras />
		<rect x={LOCAL.x - 2 * CUADRA + 12} y={LOCAL.y + CUADRA + 12} width={CUADRA - 24} height={CUADRA - 24} rx={8} fill="#b8dfb2" />
		<path d="M-50 640 C 500 420, 900 900, 1500 640 S 2500 380, 3050 560" stroke="#a9d3f5" strokeWidth={90} fill="none" strokeLinecap="round" />
		<text x={1900} y={520} fontSize={34} fontStyle="italic" fill="#5b8fbd" fontFamily={fontFamily} transform="rotate(-8 1900 520)">
			Río Ctalamochita
		</text>
		{/* Avenidas: Garibaldi (horizontal) y Roque Sáenz Peña (vertical) */}
		<line x1={0} y1={LOCAL.y} x2={MUNDO} y2={LOCAL.y} stroke="#efc76a" strokeWidth={34} />
		<line x1={LOCAL.x} y1={0} x2={LOCAL.x} y2={MUNDO} stroke="#efc76a" strokeWidth={34} />
		<line x1={0} y1={LOCAL.y} x2={MUNDO} y2={LOCAL.y} stroke="#fde39a" strokeWidth={30} />
		<line x1={LOCAL.x} y1={0} x2={LOCAL.x} y2={MUNDO} stroke="#fde39a" strokeWidth={30} />
		{[-640, -1140, 520, 1040].map((dx) => (
			<Etiqueta key={`g${dx}`} texto="Garibaldi" x={LOCAL.x + dx} y={LOCAL.y + 8} rot={0} />
		))}
		{[-560, -1060, 560, 1060].map((dy) => (
			<Etiqueta key={`r${dy}`} texto="Roque Sáenz Peña" x={LOCAL.x + 8} y={LOCAL.y + dy} rot={-90} />
		))}
		{/* Ruta desde "tu ubicación" hasta Bichos */}
		<path d={RUTA} stroke="#1a56c4" strokeWidth={20} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={LARGO_RUTA} strokeDashoffset={LARGO_RUTA * (1 - recorrido)} />
		<path d={RUTA} stroke="#4c8df6" strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={LARGO_RUTA} strokeDashoffset={LARGO_RUTA * (1 - recorrido)} />
		<circle cx={7 * CUADRA} cy={14 * CUADRA} r={44} fill="#4c8df6" opacity={0.18} />
		<circle cx={7 * CUADRA} cy={14 * CUADRA} r={16} fill="#4c8df6" stroke="#fff" strokeWidth={5} />
	</svg>
);

// Cámara: centra el local en (cx, cy) de la pantalla, con zoom, giro e inclinación 3D.
export const Camara = ({
	cx,
	cy,
	zoom,
	giro,
	inclinacion,
	desenfoque = 0,
	recorrido,
}: {
	readonly cx: number;
	readonly cy: number;
	readonly zoom: number;
	readonly giro: number;
	readonly inclinacion: number;
	readonly desenfoque?: number;
	readonly recorrido: number;
}) => (
	<div style={{position: 'absolute', inset: 0, perspective: 1400, perspectiveOrigin: `${cx}px ${cy}px`, backgroundColor: '#ece8df'}}>
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: MUNDO,
				height: MUNDO,
				transformOrigin: '0 0',
				transform: `translate(${cx}px, ${cy}px) rotateX(${inclinacion}deg) rotateZ(${giro}deg) scale(${zoom}) translate(${-LOCAL.x}px, ${-LOCAL.y}px)`,
				filter: desenfoque > 0.2 ? `blur(${desenfoque}px)` : undefined,
			}}
		>
			<MapaMundo recorrido={recorrido} />
		</div>
	</div>
);
