import {useCurrentFrame, useVideoConfig} from 'remotion';

// Manchas de color desenfocadas que flotan en el fondo violeta.
// Se mueven solas con el tiempo (decoración, no editable en Studio).
const manchas = [
	{color: '#e46a9a', size: 600, left: -160, top: 160},
	{color: '#c6e84a', size: 520, left: 700, top: 1040},
	{color: '#ffd84a', size: 440, left: 240, top: 1640},
];

export const Burbujas = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	return (
		<>
			{manchas.map((m, i) => (
				<div
					key={m.color}
					style={{
						position: 'absolute',
						left: m.left,
						top: m.top,
						width: m.size,
						height: m.size,
						borderRadius: '50%',
						backgroundColor: m.color,
						filter: 'blur(80px)',
						opacity: 0.55,
						translate: `${Math.sin(t * 1.3 + i * 2) * 80}px ${Math.cos(t * 1.1 + i) * 100}px`,
						scale: String(1 + 0.15 * Math.sin(t * 2 + i)),
					}}
				/>
			))}
		</>
	);
};
