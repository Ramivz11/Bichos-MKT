import {Video} from '@remotion/media';
import {
	Easing,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Escena 4 · El local: aparece a través del pin (portal) y se ve el clip real.
const LocalInner = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	return (
		<>
			<Video
				name="Clip del local"
				src={staticFile('bichos-local.mp4')}
				playbackRate={0.8}
				volume={0.8}
				objectFit="cover"
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					transformOrigin: '50% 35%',
					scale: interpolate(frame, [0, 0.75 * fps, durationInFrames - 0.5 * fps, durationInFrames], [1.35, 1.03, 1.03, 1.3], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
						output: 'perceptual-scale',
					}),
					rotate: interpolate(frame, [0, 0.75 * fps], ['-3deg', '0deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
					}),
					filter: `blur(${interpolate(frame, [durationInFrames - 0.5 * fps, durationInFrames], [0, 20], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}px)`,
				}}
			/>
			{/* Destello blanco al cruzar el portal */}
			<Interactive.Div
				name="Destello"
				style={{
					position: 'absolute',
					inset: 0,
					backgroundColor: 'white',
					opacity: interpolate(frame, [0, 0.15 * fps, 0.4 * fps], [0, 0.45, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
		</>
	);
};

export const Local = Interactive.create({
	Component: LocalInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.backgroundSchema,
	},
});
