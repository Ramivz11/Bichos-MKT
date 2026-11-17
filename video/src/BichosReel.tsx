import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {iris} from '@remotion/transitions/iris';
import {none} from '@remotion/transitions/none';
import {wipe} from '@remotion/transitions/wipe';
import {
	interpolate,
	staticFile,
	Track,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Chat} from './escenas/Chat';
import {Cierre} from './escenas/Cierre';
import {Gancho} from './escenas/Gancho';
import {Local} from './escenas/Local';
import {MapaEscena} from './escenas/MapaEscena';

// Reel completo de Bichos (vertical 1080×1920, 30 cuadros por segundo).
// Escenas: Gancho → Chat con la IA → Maps → Local (clip real) → Cierre (CTA).

const Musica = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	return (
		<Audio
			name="Beat"
			src={staticFile('sfx/beat.wav')}
			loop
			volume={interpolate(frame, [0, 2 * fps, 2.4 * fps, 13.9 * fps, 14.3 * fps, durationInFrames - 0.6 * fps, durationInFrames], [0.55, 0.55, 0.35, 0.35, 0.55, 0.55, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
		/>
	);
};

export const BichosReel = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<TransitionSeries name="Escenas">
				<TransitionSeries.Sequence name="1 · Gancho" durationInFrames={2.6 * fps}>
					<Gancho
						name="Gancho"
						style={{background: 'radial-gradient(120% 80% at 50% 30%, #9548b3 0%, #7d3d96 45%, #4d1f63 100%)', overflow: 'hidden'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={iris({width: 1080, height: 1920})} timing={linearTiming({durationInFrames: 15})} />
				<TransitionSeries.Sequence name="2 · Chat con la IA" durationInFrames={194}>
					<Chat name="Chat" style={{backgroundColor: '#000000'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={none()} timing={linearTiming({durationInFrames: 24})} />
				<TransitionSeries.Sequence name="3 · Maps" durationInFrames={149}>
					<MapaEscena name="Maps" style={{overflow: 'hidden'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={iris({width: 1080, height: 1920})} timing={linearTiming({durationInFrames: 15})} />
				<TransitionSeries.Sequence name="4 · Local" durationInFrames={70}>
					<Local name="Local" style={{backgroundColor: '#000000', overflow: 'hidden'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={wipe({direction: 'from-bottom-right'})} timing={linearTiming({durationInFrames: 14})} />
				<TransitionSeries.Sequence name="5 · Cierre" durationInFrames={5.5 * fps}>
					<Cierre
						name="Cierre"
						style={{background: 'radial-gradient(120% 80% at 50% 30%, #9548b3 0%, #7d3d96 45%, #4d1f63 100%)', overflow: 'hidden'}}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>

			<Track name="Efectos de interfaz">
				<Audio name="Pop ¿Dónde" src={staticFile('sfx/pop.wav')} from={3} durationInFrames={5} volume={0.5} />
				<Audio name="Pop compro" src={staticFile('sfx/pop.wav')} from={10} durationInFrames={5} volume={0.5} />
				<Audio name="Pop lo mejor" src={staticFile('sfx/pop.wav')} from={16} durationInFrames={5} volume={0.5} />
				<Audio name="Pop para mi" src={staticFile('sfx/pop.wav')} from={23} durationInFrames={5} volume={0.5} />
				<Audio name="Pop mascota" src={staticFile('sfx/pop-alto.wav')} from={29} durationInFrames={5} volume={0.5} />
				<Audio name="Pop etiqueta IA" src={staticFile('sfx/pop-alto.wav')} from={44} durationInFrames={5} volume={0.45} />
				<Audio name="Tipeo" src={staticFile('sfx/tipeo.wav')} from={83} durationInFrames={44} volume={0.6} />
				<Audio name="Enviar" src={staticFile('sfx/pop-alto.wav')} from={127} durationInFrames={5} volume={0.45} />
				<Audio name="Aparece la tarjeta" src={staticFile('sfx/pop.wav')} from={182} durationInFrames={5} volume={0.4} />
				<Audio name="Toque" src={staticFile('sfx/tap.wav')} from={230} durationInFrames={2} volume={0.9} />
				<Audio name="Pop No lo decimos" src={staticFile('sfx/pop.wav')} from={434} durationInFrames={5} volume={0.5} />
				<Audio name="Pop nosotros" src={staticFile('sfx/pop.wav')} from={441} durationInFrames={5} volume={0.5} />
				<Audio name="Pop lo dice la IA" src={staticFile('sfx/pop-alto.wav')} from={453} durationInFrames={5} volume={0.5} />
				<Audio name="Pop Vení a" src={staticFile('sfx/pop.wav')} from={498} durationInFrames={5} volume={0.5} />
				<Audio name="Pop logo" src={staticFile('sfx/pop.wav')} from={506} durationInFrames={5} volume={0.5} />
				<Audio name="Pop dirección" src={staticFile('sfx/pop.wav')} from={521} durationInFrames={5} volume={0.45} />
				<Audio name="Pop horarios" src={staticFile('sfx/pop.wav')} from={527} durationInFrames={5} volume={0.45} />
				<Audio name="Pop Te esperamos" src={staticFile('sfx/pop-alto.wav')} from={542} durationInFrames={5} volume={0.5} />
			</Track>

			<Track name="Efectos de transición">
				<Audio name="Whoosh al chat" src={staticFile('sfx/whoosh-corto.wav')} from={60} durationInFrames={15} volume={0.6} />
				<Audio name="Cae el pin" src={staticFile('sfx/pin.wav')} from={289} durationInFrames={15} volume={0.9} />
				<Audio name="Whoosh zambullida" src={staticFile('sfx/whoosh-corto.wav')} from={352} durationInFrames={15} volume={1} />
				<Audio name="Impacto portal" src={staticFile('sfx/impacto.wav')} from={367} durationInFrames={36} volume={0.8} />
				<Audio name="Whoosh al cierre" src={staticFile('sfx/whoosh-corto.wav')} from={421} durationInFrames={15} volume={0.8} />
			</Track>

			<Musica />
		</>
	);
};
