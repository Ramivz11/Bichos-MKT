import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	entrada,
	exponencial,
	mezclar,
	muySuave,
	pique,
	progreso,
	rebote,
	salida,
	suave,
} from '../comun/anim';
import {Camara} from '../comun/Mapa';
import {fontFamily, marca} from '../comun/marca';
import {TARJETA, ZOOM_CHAT} from './Chat';

// Escena 3 · Maps: la tarjeta del chat se expande, cae el pin de Bichos,
// se dibuja la ruta, la cámara gira en 3D y se zambulle en el pin.
// La cámara se calcula cuadro a cuadro (no editable con el mouse en Studio);
// el texto "A unas cuadras de tu casa" sí es editable.

// Dónde quedó el mini mapa de la tarjeta al final del chat (zoom 1.035 desde 540, 768)
const C = {
	x: 540 + (TARJETA.x - 540) * ZOOM_CHAT,
	y: 768 + (TARJETA.y - 768) * ZOOM_CHAT,
	w: TARJETA.w * ZOOM_CHAT,
	h: TARJETA.h * ZOOM_CHAT,
};

const LineasVelocidad = ({opacidad, escala}: {opacidad: number; escala: number}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: opacidad, scale: String(escala)}}>
		{Array.from({length: 46}).map((_, i) => {
			const a = (i / 46) * Math.PI * 2 + (i % 3) * 0.05;
			const r1 = 300 + (i % 5) * 60;
			const r2 = r1 + 520 + (i % 4) * 160;
			return (
				<line
					key={i}
					x1={540 + Math.cos(a) * r1}
					y1={960 + Math.sin(a) * r1}
					x2={540 + Math.cos(a) * r2}
					y2={960 + Math.sin(a) * r2}
					stroke="#fff"
					strokeWidth={4 + (i % 3) * 2}
					strokeLinecap="round"
					opacity={0.8}
				/>
			);
		})}
	</svg>
);

const MapaEscenaInner = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = (a: number, b: number, e?: (t: number) => number) => progreso(frame, fps, a, b, e);

	// 1) La tarjeta se expande a pantalla completa
	const ex = p(0, 0.8, suave);
	const L = mezclar(C.x, 0, ex);
	const T = mezclar(C.y, 0, ex);
	const R = mezclar(1080 - C.x - C.w, 0, ex);
	const B = mezclar(1920 - C.y - C.h, 0, ex);

	// 2) Cámara: zoom al local con giro, después 3D en órbita y zambullida
	const cx = mezclar(C.x + C.w / 2, 540, ex);
	let cy = mezclar(C.y + C.h / 2 + 56 * ZOOM_CHAT, mezclar(1120, 860, p(1.7, 2.7)), ex);
	let zoom = mezclar(0.6, 1.1, ex);
	let giro = 16;
	const acercar = p(0.7, 1.9, muySuave);
	zoom = mezclar(zoom, 2.7, acercar);
	giro = mezclar(giro, 0, acercar);
	const tres = p(3.1, 4.15, suave);
	const inclinacion = mezclar(0, 62, tres);
	zoom = mezclar(zoom, 4.8, tres);
	giro = mezclar(giro, -24, tres);

	const pinEscala = mezclar(0.5, 1, ex) * (1 + 0.25 * tres);
	const pinZambullida = mezclar(1, 14, p(4.05, 4.65, exponencial));
	const cabeza = 98 * pinEscala * pinZambullida; // distancia de la punta al centro del pin
	cy = mezclar(cy, 960 + cabeza, p(3.95, 4.55, suave));
	const zambullida = p(4.05, 4.7, exponencial);
	zoom *= mezclar(1, 9, zambullida);

	// 3) Pin que cae con rebote
	const caida = p(1.65, 2.25);
	const altura = caida > 0 ? pique(caida) : 0;
	const aplaste = caida > 0.36 && caida < 0.6 ? 1 - 0.15 * Math.sin(((caida - 0.36) / 0.24) * Math.PI) : 1;

	const anillo = (desde: number) => {
		const k = p(desde, desde + 0.9);
		return {opacity: k > 0 && k < 1 ? (1 - k) * 0.9 : 0, scale: `${0.3 + k * 2.2} ${(0.3 + k * 2.2) * (1 - 0.55 * tres)}`};
	};
	const etiqueta = p(2.25, 2.6) * (1 - p(3.0, 3.25));

	return (
		<>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					overflow: 'hidden',
					clipPath: `inset(${T}px ${R}px ${B}px ${L}px round ${mezclar(36, 0, ex)}px)`,
				}}
			>
				<Camara cx={cx} cy={cy} zoom={zoom} giro={giro} inclinacion={inclinacion} desenfoque={zambullida * 10} recorrido={p(1.3, 2.2, suave)} />
				{/* Niebla del horizonte cuando la cámara se inclina */}
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960, background: 'linear-gradient(#e7d6f0 0%, #ebe4ee 35%, rgba(236,232,223,0) 100%)', opacity: tres}} />

				{/* Pin de Bichos */}
				<div style={{position: 'absolute', left: cx, top: cy, width: 0, height: 0}}>
					<div style={{position: 'absolute', left: -80, top: -80, width: 160, height: 160, borderRadius: '50%', border: `6px solid ${marca.violeta}`, ...anillo(2.15)}} />
					<div style={{position: 'absolute', left: -80, top: -80, width: 160, height: 160, borderRadius: '50%', border: `6px solid ${marca.violeta}`, ...anillo(2.55)}} />
					<div
						style={{
							position: 'absolute',
							left: -32,
							top: -12,
							width: 64,
							height: 24,
							borderRadius: '50%',
							backgroundColor: 'rgba(0,0,0,0.28)',
							filter: 'blur(4px)',
							opacity: caida > 0 ? (0.3 + 0.7 * altura) * (1 - p(4.0, 4.3)) : 0,
							scale: String(pinEscala * (0.4 + 0.6 * altura)),
						}}
					/>
					<svg
						viewBox="0 0 56 76"
						width={112}
						height={152}
						style={{
							position: 'absolute',
							left: -56,
							top: -152,
							transformOrigin: '56px 152px',
							opacity: caida > 0 ? 1 : 0,
							translate: `0px ${(1 - altura) * -640}px`,
							scale: `${pinEscala * pinZambullida * (2 - aplaste)} ${pinEscala * pinZambullida * aplaste}`,
						}}
					>
						<path d="M28 2C14 2 3 13 3 27c0 19 25 47 25 47s25-28 25-47C53 13 42 2 28 2z" fill={marca.violeta} stroke="#fff" strokeWidth={3} />
						<circle cx={28} cy={27} r={13} fill="#fff" />
						<text x={28} y={33} textAnchor="middle" fontSize={17}>
							🐾
						</text>
					</svg>
					<div
						style={{
							position: 'absolute',
							left: 68,
							top: -140,
							whiteSpace: 'nowrap',
							backgroundColor: '#fff',
							borderRadius: 24,
							padding: '16px 24px',
							boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
							fontFamily,
							fontWeight: 700,
							fontSize: 32,
							color: '#1d1d1f',
							opacity: etiqueta,
							scale: String(0.85 + 0.15 * rebote(p(2.25, 2.6))),
						}}
					>
						Bichos
						<div style={{fontWeight: 500, fontSize: 24, color: '#5f6368', marginTop: 4}}>Garibaldi y Roque Sáenz Peña</div>
					</div>
				</div>

				{/* Barra de búsqueda */}
				<div
					style={{
						position: 'absolute',
						left: 32,
						right: 32,
						top: 88,
						height: 104,
						backgroundColor: '#fff',
						borderRadius: 52,
						boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
						display: 'flex',
						alignItems: 'center',
						gap: 24,
						padding: '0 36px',
						fontFamily,
						fontSize: 32,
						color: '#202124',
						translate: `0px ${(1 - p(0.65, 1.05, salida)) * -240 + p(3.0, 3.3, entrada) * -280}px`,
					}}
				>
					<span style={{fontSize: 44, color: '#5f6368'}}>←</span>
					<span>Bichos · Tienda de mascotas</span>
				</div>

				{/* Ficha del local */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: 500,
						backgroundColor: '#fff',
						borderRadius: '44px 44px 0 0',
						boxShadow: '0 -12px 48px rgba(0,0,0,0.18)',
						padding: '28px 44px',
						fontFamily,
						translate: `0px ${(1 - rebote(p(2.05, 2.5))) * 560 + p(2.95, 3.3, entrada) * 600}px`,
					}}
				>
					<div style={{width: 80, height: 10, borderRadius: 6, backgroundColor: '#dadce0', margin: '0 auto 28px'}} />
					<div style={{fontSize: 52, fontWeight: 700, color: '#202124'}}>Bichos</div>
					<div style={{fontSize: 28, color: '#5f6368', marginTop: 8}}>Tienda de mascotas · Garibaldi y Roque Sáenz Peña</div>
					<div style={{fontSize: 28, color: '#f4b400', marginTop: 12}}>
						★★★★★ <span style={{color: '#5f6368'}}>5,0</span>
					</div>
					<div style={{fontSize: 28, color: '#5f6368', marginTop: 16}}>
						<b style={{color: '#188038'}}>Abierto</b> · Lun a Sáb 9–13 h · 16:30–21 h
					</div>
					<div style={{display: 'flex', gap: 20, marginTop: 32, fontSize: 30, fontWeight: 600}}>
						<span style={{padding: '22px 36px', borderRadius: 44, backgroundColor: '#0b57d0', color: '#fff'}}>➤ Cómo llegar</span>
						<span style={{padding: '22px 36px', borderRadius: 44, border: '2px solid #dadce0', color: '#0b57d0'}}>Llamar</span>
						<span style={{padding: '22px 36px', borderRadius: 44, border: '2px solid #dadce0', color: '#0b57d0'}}>Guardar</span>
					</div>
				</div>

				<Interactive.Div
					name="Texto sobre el mapa"
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 300,
						textAlign: 'center',
						fontFamily,
						fontWeight: 900,
						fontSize: 88,
						lineHeight: 1.02,
						letterSpacing: -3,
						color: 'white',
						textShadow: '0 8px 36px rgba(60,10,80,0.55)',
						opacity: interpolate(frame, [3.25 * fps, 3.55 * fps, 3.95 * fps, 4.1 * fps], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [3.25 * fps, 3.55 * fps, 3.95 * fps, 4.1 * fps], [0.7, 1, 1, 1.2], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
					}}
				>
					A unas cuadras
					<br />
					de <span style={{color: '#ffd84a'}}>tu casa</span>
				</Interactive.Div>

				{/* Crédito de los datos del mapa */}
				<div style={{position: 'absolute', left: 24, bottom: 16, fontFamily, fontSize: 20, color: 'rgba(60,60,60,0.75)', opacity: p(0.8, 1.1) * (1 - p(3.9, 4.1))}}>
					© OpenStreetMap
				</div>

				<LineasVelocidad opacidad={Math.sin(p(4.15, 4.6) * Math.PI)} escala={1 + p(4.15, 4.6) * 0.6} />
			</div>
		</>
	);
};

export const MapaEscena = Interactive.create({
	Component: MapaEscenaInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.backgroundSchema,
	},
});
