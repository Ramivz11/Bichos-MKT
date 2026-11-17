import {
	Easing,
	Img,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Burbujas} from '../comun/Burbujas';
import {fontFamily} from '../comun/marca';

// Escena 5 · Cierre (CTA opción 1): "No lo decimos nosotros… lo dice la IA 😉"
// y después "Vení a Bichos" con dirección y horarios.
const CierreInner = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<>
			<Burbujas />

			{/* Parte A */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					right: 80,
					top: 600,
					textAlign: 'center',
					fontFamily,
					fontWeight: 900,
					fontSize: 132,
					lineHeight: 0.98,
					letterSpacing: -4,
					color: 'white',
				}}
			>
				<Interactive.Div
					name="No lo decimos"
					style={{
						opacity: interpolate(frame, [0.35 * fps, 0.37 * fps, 3.1 * fps, 3.35 * fps], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.35 * fps, 0.67 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						translate: interpolate(frame, [0.35 * fps, 0.67 * fps, 3.1 * fps, 3.35 * fps], ['0px 80px', '0px 0px', '0px 0px', '0px -160px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						}),
						rotate: interpolate(frame, [0.35 * fps, 0.67 * fps], ['-5deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					No lo decimos
				</Interactive.Div>
				<Interactive.Div
					name="nosotros…"
					style={{
						opacity: interpolate(frame, [0.6 * fps, 0.62 * fps, 3.15 * fps, 3.4 * fps], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.6 * fps, 0.92 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						translate: interpolate(frame, [0.6 * fps, 0.92 * fps, 3.15 * fps, 3.4 * fps], ['0px 80px', '0px 0px', '0px 0px', '0px -160px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						}),
						rotate: interpolate(frame, [0.6 * fps, 0.92 * fps], ['5deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					nosotros…
				</Interactive.Div>
				<Interactive.Div
					name="lo dice la IA"
					style={{
						display: 'inline-block',
						whiteSpace: 'nowrap',
						fontSize: 112,
						marginTop: 28,
						padding: '0 28px 12px',
						borderRadius: 28,
						backgroundColor: '#ffd84a',
						color: '#3a1448',
						opacity: interpolate(frame, [1.6 * fps, 1.62 * fps, 3.2 * fps, 3.45 * fps], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [1.6 * fps, 1.98 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						translate: interpolate(frame, [1.6 * fps, 1.98 * fps, 3.2 * fps, 3.45 * fps], ['0px 80px', '0px 0px', '0px 0px', '0px -160px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						}),
						rotate: interpolate(frame, [1.6 * fps, 1.98 * fps], ['-4deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					lo dice la IA 😉
				</Interactive.Div>
			</div>

			{/* Parte B */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					right: 80,
					top: 330,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					fontFamily,
				}}
			>
				<Interactive.Div
					name="Vení a"
					style={{
						fontWeight: 900,
						fontSize: 112,
						letterSpacing: -3,
						color: 'white',
						opacity: interpolate(frame, [3.35 * fps, 3.37 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [3.35 * fps, 3.65 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
					}}
				>
					Vení a
				</Interactive.Div>
				<Img
					name="Logo de Bichos"
					src={staticFile('bichos-logo.png')}
					style={{
						width: 900,
						marginTop: 48,
						filter: 'drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 28px 36px rgba(40,0,60,0.45))',
						opacity: interpolate(frame, [3.6 * fps, 3.62 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [3.6 * fps, 4.05 * fps, 6.2 * fps], [0.3, 1, 1.04], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [3.6 * fps, 4.05 * fps, 5 * fps, 6.2 * fps], ['-10deg', '-3deg', '-1deg', '-3deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						}),
					}}
				/>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 72}}>
					<Interactive.Div
						name="Dirección"
						style={{
							backgroundColor: 'rgba(255,255,255,0.14)',
							border: '3px solid rgba(255,255,255,0.35)',
							color: 'white',
							fontWeight: 700,
							fontSize: 44,
							padding: '24px 40px',
							borderRadius: 32,
							opacity: interpolate(frame, [4.1 * fps, 4.12 * fps], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							scale: interpolate(frame, [4.1 * fps, 4.4 * fps], [0.3, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.out(Easing.back(1.9)),
								output: 'perceptual-scale',
							}),
						}}
					>
						📍 Garibaldi y Roque Sáenz Peña
					</Interactive.Div>
					<Interactive.Div
						name="Horarios"
						style={{
							backgroundColor: 'rgba(255,255,255,0.14)',
							border: '3px solid rgba(255,255,255,0.35)',
							color: 'white',
							fontWeight: 700,
							fontSize: 44,
							padding: '24px 40px',
							borderRadius: 32,
							opacity: interpolate(frame, [4.3 * fps, 4.32 * fps], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							scale: interpolate(frame, [4.3 * fps, 4.6 * fps], [0.3, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.out(Easing.back(1.9)),
								output: 'perceptual-scale',
							}),
						}}
					>
						🕘 Lun a Sáb · 9 a 13 h y 16:30 a 21 h
					</Interactive.Div>
				</div>
			</div>

			<div style={{position: 'absolute', left: 0, right: 0, bottom: 200, display: 'flex', justifyContent: 'center'}}>
				<Interactive.Div
					name="Te esperamos"
					style={{
						fontFamily,
						fontWeight: 800,
						fontSize: 56,
						color: '#3a1448',
						backgroundColor: '#ffd84a',
						padding: '32px 64px',
						borderRadius: 80,
						boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
						whiteSpace: 'nowrap',
						opacity: interpolate(frame, [4.8 * fps, 4.82 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [4.8 * fps, 5.15 * fps, 5.45 * fps, 5.75 * fps, 6.05 * fps], [0.3, 1, 1.06, 1, 1.06], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
					}}
				>
					Te esperamos 🐾
				</Interactive.Div>
			</div>
		</>
	);
};

export const Cierre = Interactive.create({
	Component: CierreInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.backgroundSchema,
	},
});
