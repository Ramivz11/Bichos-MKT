import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Tipografía de todo el reel: Inter, guardada dentro del proyecto (public/fonts)
// para que funcione sin internet. Licencia SIL Open Font License.
export const fontFamily = 'Inter';

const pesos = [
	['Regular', '400'],
	['Medium', '500'],
	['SemiBold', '600'],
	['Bold', '700'],
	['ExtraBold', '800'],
	['Black', '900'],
] as const;

for (const [archivo, weight] of pesos) {
	loadFont({
		family: fontFamily,
		url: staticFile(`fonts/Inter-${archivo}.otf`),
		weight,
	});
}

// Colores sacados del cartel del local
export const marca = {
	violeta: '#7d3d96',
	violetaOscuro: '#4d1f63',
	rosa: '#e46a9a',
	lima: '#c6e84a',
	amarillo: '#ffd84a',
	textoOscuro: '#3a1448',
} as const;
