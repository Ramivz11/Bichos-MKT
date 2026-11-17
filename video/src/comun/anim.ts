import {Easing, interpolate} from 'remotion';

// Ayudas para animaciones calculadas cuadro a cuadro (mapa, chat, tipeo).
// Los tiempos se pasan en segundos y se convierten a cuadros con `fps`.

export const progreso = (
	frame: number,
	fps: number,
	desde: number,
	hasta: number,
	easing: (t: number) => number = (t) => t,
) =>
	interpolate(frame, [desde * fps, hasta * fps], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

export const mezclar = (a: number, b: number, k: number) => a + (b - a) * k;

export const suave = Easing.inOut(Easing.cubic);
export const salida = Easing.out(Easing.cubic);
export const entrada = Easing.in(Easing.cubic);
export const muySuave = Easing.inOut(Easing.poly(5));
export const rebote = Easing.out(Easing.back(1.9));
export const exponencial = Easing.in(Easing.exp);
export const pique = Easing.bounce;
