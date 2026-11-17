import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {mezclar, progreso, rebote, salida, suave} from '../comun/anim';
import {Camara} from '../comun/Mapa';
import {fontFamily} from '../comun/marca';

// Escena 2 · Chat con la IA: se tipea la pregunta, responde y aparece la ubicación.

const PREGUNTA =
	'¿Dónde están los mejores accesorios para mascotas en Río Tercero?';

// Rectángulo del mini mapa dentro de la tarjeta (lo usa también la escena del mapa)
export const TARJETA = {x: 48, y: 940, w: 984, h: 380};
// Zoom final del chat antes de pasar al mapa (centro 540, 768)
export const ZOOM_CHAT = 1.035;

// ---------- Teclado ----------
const FILAS = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];
const ALTO_TECLADO = 680;
const filaTop = [68, 190, 312, 434];
const posTecla = (fila: number, i: number) => ({
	x: (fila === 2 ? 196 : 46) + i * 100,
	y: filaTop[fila],
});
const MAPA_TECLAS: Record<string, string> = {á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u'};

const teclaDe = (c: string) => {
	if (c === ' ') return 'espacio';
	if (c === '¿' || c === '?') return '123';
	return MAPA_TECLAS[c] ?? c.toLowerCase();
};

const Tecla = ({
	x,
	y,
	w,
	activa,
	children,
	size = 48,
}: {
	x: number;
	y: number;
	w: number;
	activa: boolean;
	children?: React.ReactNode;
	size?: number;
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			height: 100,
			borderRadius: 18,
			backgroundColor: activa ? '#8a8a8a' : '#3d3d3d',
			color: 'white',
			fontSize: size,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		{children}
	</div>
);

const Teclado = ({tecla, bajada}: {tecla: string | null; bajada: number}) => {
	let popup: {x: number; y: number; letra: string} | null = null;
	const teclas: React.ReactNode[] = [];
	FILAS.forEach((fila, f) => {
		fila.split('').forEach((c, i) => {
			const p = posTecla(f, i);
			if (tecla === c) popup = {x: p.x + 44, y: p.y, letra: c};
			teclas.push(
				<Tecla key={c} x={p.x} y={p.y} w={88} activa={tecla === c}>
					{c}
				</Tecla>,
			);
		});
	});
	const pop = popup as {x: number; y: number; letra: string} | null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 0,
				height: ALTO_TECLADO,
				backgroundColor: '#1b1b1b',
				borderRadius: '60px 60px 0 0',
				translate: `0px ${bajada * 720}px`,
			}}
		>
			{teclas}
			<Tecla x={44} y={312} w={140} activa={false} size={40}>⇧</Tecla>
			<Tecla x={896} y={312} w={140} activa={false} size={40}>⌫</Tecla>
			<Tecla x={78} y={434} w={208} activa={tecla === '123'} size={36}>123</Tecla>
			<Tecla x={298} y={434} w={472} activa={tecla === 'espacio'} />
			<Tecla x={782} y={434} w={220} activa={false} size={44}>↵</Tecla>
			{pop ? (
				<div
					style={{
						position: 'absolute',
						left: pop.x - 56,
						top: pop.y - 124,
						width: 112,
						height: 140,
						borderRadius: 24,
						backgroundColor: '#5a5a5a',
						color: 'white',
						fontSize: 68,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
					}}
				>
					{pop.letra}
				</div>
			) : null}
		</div>
	);
};

// ---------- Íconos simples ----------
const IconoMenu = () => (
	<svg width={48} height={36} viewBox="0 0 24 18">
		<path d="M2 6h12M2 12h9" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
		<circle cx={19} cy={4} r={4} fill="#2f6bf2" />
	</svg>
);
const IconoChat = () => (
	<svg width={52} height={52} viewBox="0 0 26 26">
		<path d="M13 3a10 10 0 1 1-6.8 17.3L3 22l1.2-4.2A10 10 0 0 1 13 3z" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
	</svg>
);
const IconoImagen = () => (
	<svg width={52} height={48} viewBox="0 0 26 24">
		<rect x={2} y={2} width={22} height={20} rx={4} fill="none" stroke="#ddd" strokeWidth={2} />
		<circle cx={17} cy={9} r={2.5} fill="none" stroke="#ddd" strokeWidth={2} />
		<path d="M3 19l7-7 5 5" fill="none" stroke="#ddd" strokeWidth={2} />
	</svg>
);
const IconoLapiz = () => (
	<svg width={52} height={48} viewBox="0 0 26 24">
		<path d="M4 20l1.5-5L17 3.5l3.5 3.5L9 18.5z" fill="none" stroke="#ddd" strokeWidth={2} strokeLinejoin="round" />
	</svg>
);
const IconoWeb = () => (
	<svg width={52} height={52} viewBox="0 0 26 26">
		<circle cx={13} cy={13} r={10} fill="none" stroke="#ddd" strokeWidth={2} />
		<ellipse cx={13} cy={13} rx={4.5} ry={10} fill="none" stroke="#ddd" strokeWidth={2} />
		<path d="M3 13h20" stroke="#ddd" strokeWidth={2} />
	</svg>
);

// ---------- Escena ----------
const ChatInner = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;

	// Tipeo de la pregunta
	const tipeo = progreso(frame, fps, 0.65, 2.05);
	const letras = Math.round(tipeo * PREGUNTA.length);
	const enviado = t >= 2.1;
	const hayTexto = letras > 0 && !enviado;
	const tecla = tipeo > 0 && tipeo < 1 && letras > 0 ? teclaDe(PREGUNTA[letras - 1]) : null;
	const cursorVisible = !enviado && (Math.floor(t * 2.5) % 2 === 0 || (tipeo > 0 && tipeo < 1));

	// Teclado baja y la barra de texto va abajo al enviar
	const bajada = progreso(frame, fps, 2.1, 2.45, suave);

	// Puntitos de "pensando"
	const pensando = t > 2.35 && t < 2.85;

	// Tarjeta de ubicación
	const tarjeta = progreso(frame, fps, 3.95, 4.4);

	// Toque en la tarjeta
	const llegaDedo = progreso(frame, fps, 4.9, 5.35, salida);
	const dedoX = mezclar(840, 600, llegaDedo);
	const dedoY = mezclar(1720, 1120, llegaDedo);
	const presion = progreso(frame, fps, 5.45, 5.57) - progreso(frame, fps, 5.57, 5.7);
	const onda = progreso(frame, fps, 5.55, 6.0);

	// Salida: se achica, se desenfoca y se desvanece mientras entra el mapa
	const salidaChat = interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames - 0.2 * fps], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const empuje = progreso(frame, fps, 0.5, 5.55, suave);

	return (
		<>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundColor: '#000',
					color: '#ececec',
					fontFamily,
					transformOrigin: '540px 768px',
					scale: String(mezclar(1, ZOOM_CHAT, empuje) * (1 - 0.06 * salida(salidaChat))),
					filter: salidaChat > 0 ? `blur(${salidaChat * 12}px)` : undefined,
					opacity: 1 - salidaChat,
				}}
			>
				{/* Barra de estado */}
				<div style={{position: 'absolute', left: 104, right: 68, top: 20, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: 34, color: 'white'}}>
					<span>19:59</span>
					<span style={{display: 'flex', alignItems: 'center', gap: 14}}>
						<span style={{display: 'flex', alignItems: 'flex-end', gap: 4}}>
							{[12, 18, 24, 30].map((h, i) => (
								<span key={h} style={{display: 'block', width: 7, height: h, backgroundColor: 'white', borderRadius: 2, opacity: i > 1 ? 0.4 : 1}} />
							))}
						</span>
						<svg width={40} height={30} viewBox="0 0 20 15">
							<path d="M10 13.5l2.6-3a3.6 3.6 0 0 0-5.2 0zM4.6 7.6a7.6 7.6 0 0 1 10.8 0l-1.8 2a5 5 0 0 0-7.2 0zM1.5 4.5a12 12 0 0 1 17 0l-1.6 1.9a9.6 9.6 0 0 0-13.8 0z" fill="#fff" />
						</svg>
						<span style={{backgroundColor: '#e5484d', color: 'white', fontSize: 24, fontWeight: 700, borderRadius: 10, padding: '2px 12px'}}>14</span>
					</span>
				</div>
				{/* Encabezado: menú, Chat/Work, nuevo chat */}
				<div style={{position: 'absolute', left: 40, right: 40, top: 116, height: 112, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<div style={{width: 112, height: 112, borderRadius: '50%', backgroundColor: '#141414', border: '2px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<IconoMenu />
					</div>
					<div style={{height: 112, borderRadius: 56, backgroundColor: '#141414', border: '2px solid #2a2a2a', display: 'flex', alignItems: 'center', padding: 8, gap: 8, fontSize: 34, color: 'white'}}>
						<span style={{padding: '24px 48px', borderRadius: 48, backgroundColor: '#333'}}>Chat</span>
						<span style={{padding: '24px 48px'}}>Work</span>
					</div>
					<div style={{width: 112, height: 112, borderRadius: '50%', backgroundColor: '#141414', border: '2px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<IconoChat />
					</div>
				</div>

				{/* Sugerencias (se van al enviar) */}
				<div style={{position: 'absolute', left: 60, top: 660, fontSize: 34, color: '#e6e6e6', opacity: 1 - progreso(frame, fps, 2.1, 2.3)}}>
					{[
						{icono: <IconoImagen />, texto: 'Crear una imagen o sticker'},
						{icono: <IconoLapiz />, texto: 'Escribe o edita'},
						{icono: <IconoWeb />, texto: 'Busca en la web'},
					].map((s) => (
						<div key={s.texto} style={{display: 'flex', alignItems: 'center', gap: 40, height: 120}}>
							{s.icono}
							{s.texto}
						</div>
					))}
				</div>

				{/* Burbuja de la pregunta enviada */}
				<div
					style={{
						position: 'absolute',
						right: 40,
						top: 260,
						maxWidth: 760,
						backgroundColor: '#303030',
						borderRadius: 44,
						padding: '26px 34px',
						fontSize: 31,
						lineHeight: 1.4,
						transformOrigin: '100% 100%',
						opacity: enviado ? 1 : 0,
						translate: `0px ${(1 - progreso(frame, fps, 2.1, 2.5, salida)) * 840}px`,
						scale: String(0.9 + 0.1 * progreso(frame, fps, 2.1, 2.5, rebote)),
					}}
				>
					{PREGUNTA}
				</div>

				{/* Respuesta de la IA */}
				<div style={{position: 'absolute', left: 48, right: 48, top: 456, fontSize: 31, lineHeight: 1.55}}>
					<div style={{width: 56, height: 56, borderRadius: '50%', marginBottom: 16, background: 'conic-gradient(from 0deg, #e46a9a, #c6e84a, #ffd84a, #7d3d96, #e46a9a)', opacity: progreso(frame, fps, 2.3, 2.5)}} />
					{pensando ? (
						<div style={{display: 'flex', gap: 12, position: 'absolute', top: 84}}>
							{[0, 1, 2].map((i) => (
								<span key={i} style={{display: 'block', width: 18, height: 18, borderRadius: '50%', backgroundColor: '#bbb', translate: `0px ${-10 * Math.max(0, Math.sin(t * 12 - i * 0.9))}px`}} />
							))}
						</div>
					) : null}
					<Interactive.Div
						name="Respuesta línea 1"
						style={{
							marginBottom: 12,
							opacity: interpolate(frame, [2.85 * fps, 3.2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
							translate: interpolate(frame, [2.85 * fps, 3.2 * fps], ['0px 28px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}),
						}}
					>
						¡La mejor opción es <Resaltado desde={3.65}><b>Bichos</b></Resaltado>! 🐾
					</Interactive.Div>
					<Interactive.Div
						name="Respuesta línea 2"
						style={{
							marginBottom: 12,
							opacity: interpolate(frame, [3.13 * fps, 3.48 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
							translate: interpolate(frame, [3.13 * fps, 3.48 * fps], ['0px 28px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}),
						}}
					>
						📍 <Resaltado desde={3.85}>Garibaldi y Roque Sáenz Peña</Resaltado>
					</Interactive.Div>
					<Interactive.Div
						name="Respuesta línea 3"
						style={{
							marginBottom: 12,
							opacity: interpolate(frame, [3.41 * fps, 3.76 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
							translate: interpolate(frame, [3.41 * fps, 3.76 * fps], ['0px 28px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}),
						}}
					>
						🕘 Lunes a sábado · <Resaltado desde={4.05}>9 a 13 h y 16:30 a 21 h</Resaltado>
					</Interactive.Div>
					<Interactive.Div
						name="Respuesta línea 4"
						style={{
							marginBottom: 12,
							opacity: interpolate(frame, [3.69 * fps, 4.04 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
							translate: interpolate(frame, [3.69 * fps, 4.04 * fps], ['0px 28px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}),
						}}
					>
						Te dejo la ubicación 👇
					</Interactive.Div>
				</div>

				{/* Tarjeta de ubicación con mini mapa */}
				<div
					style={{
						position: 'absolute',
						left: TARJETA.x,
						top: TARJETA.y,
						width: TARJETA.w,
						height: 600,
						borderRadius: 36,
						backgroundColor: '#2b2b2b',
						border: '2px solid #3a3a3a',
						overflow: 'hidden',
						opacity: tarjeta > 0 ? 1 : 0,
						translate: `0px ${(1 - rebote(tarjeta)) * 240}px`,
					}}
				>
					<div style={{position: 'absolute', left: 0, top: 0, width: TARJETA.w, height: TARJETA.h, overflow: 'hidden'}}>
						<Camara cx={TARJETA.w / 2} cy={TARJETA.h / 2 + 56} zoom={0.6} giro={16} inclinacion={0} recorrido={0} en3d={false} />
					</div>
					<div style={{position: 'absolute', left: 32, bottom: 40}}>
						<div style={{fontSize: 34, fontWeight: 700}}>Bichos</div>
						<div style={{fontSize: 27, color: '#b4b4b4', marginTop: 8}}>Tienda de mascotas · Río Tercero, Córdoba</div>
					</div>
					<div style={{position: 'absolute', right: 32, bottom: 36, backgroundColor: '#ececec', color: '#111', fontWeight: 600, fontSize: 27, padding: '18px 28px', borderRadius: 36}}>
						Abrir en Maps ↗
					</div>
				</div>

				<Teclado tecla={tecla} bajada={bajada} />

				{/* Barra para escribir */}
				<div
					style={{
						position: 'absolute',
						left: 32,
						right: 32,
						bottom: mezclar(ALTO_TECLADO + 24, 52, bajada),
						minHeight: 124,
						borderRadius: 62,
						backgroundColor: '#111',
						border: '2px solid #2c2c2c',
						display: 'flex',
						alignItems: 'center',
						padding: '24px 210px 24px 116px',
						fontSize: 34,
						lineHeight: 1.35,
					}}
				>
					<span style={{position: 'absolute', left: 36, bottom: 30, fontSize: 60, fontWeight: 300, lineHeight: '60px', color: 'white'}}>+</span>
					<span>
						{letras === 0 && !enviado ? <span style={{color: '#8e8e8e'}}>Preguntar a la IA</span> : null}
						{enviado ? '' : PREGUNTA.slice(0, letras)}
						<span style={{display: 'inline-block', width: 4, height: 38, backgroundColor: '#ececec', verticalAlign: -6, marginLeft: 2, opacity: cursorVisible ? 1 : 0}} />
					</span>
					<svg style={{position: 'absolute', right: 144, bottom: 34, opacity: hayTexto ? 0 : 1}} width={44} height={56} viewBox="0 0 22 28">
						<rect x={6} y={1} width={10} height={17} rx={5} fill="none" stroke="#fff" strokeWidth={2.2} />
						<path d="M2 13a9 9 0 0 0 18 0M11 22v5" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
					</svg>
					<div
						style={{
							position: 'absolute',
							right: 16,
							bottom: 16,
							width: 92,
							height: 92,
							borderRadius: '50%',
							backgroundColor: hayTexto ? '#fff' : '#2f6bf2',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							scale: t > 1.95 && t < 2.12 ? '0.85' : '1',
						}}
					>
						{hayTexto ? (
							<svg width={40} height={40} viewBox="0 0 20 20">
								<path d="M10 17V3M4 9l6-6 6 6" stroke="#000" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						) : (
							<svg width={44} height={36} viewBox="0 0 22 18">
								<path d="M3 7v4M7 3v12M11 6v6M15 2v14M19 7v4" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
							</svg>
						)}
					</div>
				</div>
			</div>

			{/* Dedo que toca la tarjeta */}
			<div
				style={{
					position: 'absolute',
					left: dedoX - 64,
					top: dedoY - 64,
					width: 128,
					height: 128,
					borderRadius: '50%',
					backgroundColor: 'rgba(255,255,255,0.55)',
					border: '4px solid rgba(255,255,255,0.9)',
					boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
					opacity: llegaDedo * (1 - progreso(frame, fps, 5.7, 5.9)),
					scale: String(1 - 0.25 * presion),
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: dedoX - 64,
					top: dedoY - 64,
					width: 128,
					height: 128,
					borderRadius: '50%',
					border: '6px solid white',
					opacity: onda > 0 && onda < 1 ? 1 - onda : 0,
					scale: String(1 + onda * 3),
				}}
			/>
		</>
	);
};

// Resaltador rosa que se "pinta" debajo del texto
const Resaltado = ({desde, children}: {desde: number; children: React.ReactNode}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const ancho = progreso(frame, fps, desde, desde + 0.35, salida) * 100;
	return (
		<span
			style={{
				backgroundImage: 'linear-gradient(rgba(228,106,154,0.6), rgba(228,106,154,0.6))',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: '0 92%',
				backgroundSize: `${ancho}% 40%`,
			}}
		>
			{children}
		</span>
	);
};

export const Chat = Interactive.create({
	Component: ChatInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.backgroundSchema,
	},
});
