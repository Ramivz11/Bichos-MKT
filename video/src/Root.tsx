import {Composition, Folder} from 'remotion';
import {BichosReel} from './BichosReel';
import {Chat} from './escenas/Chat';
import {Cierre} from './escenas/Cierre';
import {Gancho} from './escenas/Gancho';
import {Local} from './escenas/Local';
import {MapaEscena} from './escenas/MapaEscena';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="BichosReel"
				component={BichosReel}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={588}
			/>
			<Folder name="Escenas">
				<Composition
					id="Gancho"
					component={Gancho}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={78}
					defaultProps={{
						style: {
							background: 'radial-gradient(120% 80% at 50% 30%, #9548b3 0%, #7d3d96 45%, #4d1f63 100%)',
							overflow: 'hidden',
						},
					}}
				/>
				<Composition
					id="Chat"
					component={Chat}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={194}
					defaultProps={{style: {backgroundColor: '#000000'}}}
				/>
				<Composition
					id="Maps"
					component={MapaEscena}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={149}
					defaultProps={{style: {overflow: 'hidden'}}}
				/>
				<Composition
					id="Local"
					component={Local}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={70}
					defaultProps={{style: {backgroundColor: '#000000', overflow: 'hidden'}}}
				/>
				<Composition
					id="Cierre"
					component={Cierre}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={165}
					defaultProps={{
						style: {
							background: 'radial-gradient(120% 80% at 50% 30%, #9548b3 0%, #7d3d96 45%, #4d1f63 100%)',
							overflow: 'hidden',
						},
					}}
				/>
			</Folder>
		</>
	);
};
