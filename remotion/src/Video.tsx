import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts, ACTS } from './styles';
import { Act1Start } from './sequences/Act1-Start';
import { Act2Focus } from './sequences/Act2-Focus';
import { Act3Concentrate } from './sequences/Act3-Concentrate';
import { Act4Review } from './sequences/Act4-Review';
import { Act5Outro } from './sequences/Act5-Outro';

export const HeyFocusDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // Act 4부터 줌 아웃 (카메라가 뒤로 빠지면서 여러 창을 보여줌)
  const scale = interpolate(
    frame,
    [ACTS.act4.start - 30, ACTS.act4.start],
    [1, 0.65],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bgBase,
        fontFamily: fonts.sans,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Act 1: 시작 (0-15초) */}
        <Sequence from={ACTS.act1.start} durationInFrames={ACTS.act1.end - ACTS.act1.start}>
          <Act1Start />
        </Sequence>

        {/* Act 2: 포커스 & 정리 (15-30초) */}
        <Sequence from={ACTS.act2.start} durationInFrames={ACTS.act2.end - ACTS.act2.start}>
          <Act2Focus />
        </Sequence>

        {/* Act 3: 집중 모드 (30-45초) */}
        <Sequence from={ACTS.act3.start} durationInFrames={ACTS.act3.end - ACTS.act3.start}>
          <Act3Concentrate />
        </Sequence>

        {/* Act 4: 리뷰 & 통계 (45-70초) */}
        <Sequence from={ACTS.act4.start} durationInFrames={ACTS.act4.end - ACTS.act4.start}>
          <Act4Review />
        </Sequence>

        {/* Act 5: 마무리 (70-80초) */}
        <Sequence from={ACTS.act5.start} durationInFrames={ACTS.act5.end - ACTS.act5.start}>
          <Act5Outro />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
