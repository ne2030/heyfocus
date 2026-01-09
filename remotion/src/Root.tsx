import { Composition } from 'remotion';
import { HeyFocusDemo } from './Video';
import { VIDEO_CONFIG } from './styles';
import './app-styles.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeyFocusDemo"
        component={HeyFocusDemo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
    </>
  );
};
