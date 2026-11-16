import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Burbujas} from '../comun/Burbujas';
import {fontFamily, marca} from '../comun/marca';

// Escena 1 · Gancho: la pregunta aparece palabra por palabra.
const GanchoInner = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<>
			<Burbujas />
			{/* Al final el texto se agranda y se desenfoca para pasar al chat */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 500,
					textAlign: 'center',
					fontFamily,
					fontWeight: 900,
					fontSize: 156,
					lineHeight: 0.98,
					letterSpacing: -5,
					color: 'white',
					scale: interpolate(frame, [1.9 * fps, 2.6 * fps], [1, 1.5], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
					}),
					filter: `blur(${interpolate(frame, [1.9 * fps, 2.6 * fps], [0, 16], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}px)`,
				}}
			>
				<Interactive.Div
					name="Palabra 1"
					style={{
						opacity: interpolate(frame, [0.1 * fps, 0.12 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.1 * fps, 0.42 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [0.1 * fps, 0.42 * fps], ['-8deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}),
					}}
				>
					¿Dónde
				</Interactive.Div>
				<Interactive.Div
					name="Palabra 2"
					style={{
						opacity: interpolate(frame, [0.32 * fps, 0.34 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.32 * fps, 0.64 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [0.32 * fps, 0.64 * fps], ['5deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}),
					}}
				>
					compro
				</Interactive.Div>
				<Interactive.Div
					name="Palabra 3"
					style={{
						opacity: interpolate(frame, [0.54 * fps, 0.56 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.54 * fps, 0.86 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [0.54 * fps, 0.86 * fps], ['-4deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}),
					}}
				>
					lo mejor
				</Interactive.Div>
				<Interactive.Div
					name="Palabra 4"
					style={{
						opacity: interpolate(frame, [0.76 * fps, 0.78 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.76 * fps, 1.08 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [0.76 * fps, 1.08 * fps], ['6deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}),
					}}
				>
					para mi
				</Interactive.Div>
				<Interactive.Div
					name="Palabra 5 (resaltada)"
					style={{
						display: 'inline-block',
						marginTop: 6,
						padding: '0 28px 12px',
						borderRadius: 28,
						backgroundColor: '#ffd84a',
						color: '#3a1448',
						opacity: interpolate(frame, [0.98 * fps, 1 * fps], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [0.98 * fps, 1.36 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [0.98 * fps, 1.36 * fps], ['-5deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}),
					}}
				>
					mascota?
				</Interactive.Div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 1480,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Interactive.Div
					name="Etiqueta IA"
					style={{
						fontFamily,
						fontWeight: 800,
						fontSize: 46,
						color: marca.textoOscuro,
						backgroundColor: '#c6e84a',
						padding: '24px 40px',
						borderRadius: 80,
						boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
						whiteSpace: 'nowrap',
						opacity: interpolate(frame, [1.45 * fps, 1.47 * fps, 1.9 * fps, 2.3 * fps], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						scale: interpolate(frame, [1.45 * fps, 1.8 * fps], [0.3, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.back(1.9)),
							output: 'perceptual-scale',
						}),
						rotate: interpolate(frame, [1.45 * fps, 1.8 * fps], ['4deg', '0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.out(Easing.cubic),
						}),
					}}
				>
					🤖 Le preguntamos a la IA
				</Interactive.Div>
			</div>
		</>
	);
};

export const Gancho = Interactive.create({
	Component: GanchoInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.backgroundSchema,
	},
});
