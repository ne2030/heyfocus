import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Easing } from 'remotion';
import { colors, fonts } from '../styles';

export const Act5Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // 타이밍
  const FADE_IN_START = 0;
  const TEXT_APPEAR = 60;
  const TAGLINE_APPEAR = 120;
  const FADE_OUT_START = 240;

  // 애니메이션
  const bgOpacity = interpolate(
    frame,
    [FADE_IN_START, FADE_IN_START + 30],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const logoScale = interpolate(
    frame,
    [TEXT_APPEAR, TEXT_APPEAR + 30],
    [0.8, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );

  const logoOpacity = interpolate(
    frame,
    [TEXT_APPEAR, TEXT_APPEAR + 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const taglineY = interpolate(
    frame,
    [TAGLINE_APPEAR, TAGLINE_APPEAR + 30],
    [20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const taglineOpacity = interpolate(
    frame,
    [TAGLINE_APPEAR, TAGLINE_APPEAR + 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // 슬롯 인디케이터 애니메이션
  const slotsOpacity = interpolate(
    frame,
    [TAGLINE_APPEAR + 30, TAGLINE_APPEAR + 50],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bgBase,
        opacity: bgOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}
    >
      {/* Logo / App Name */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* App Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 60px ${colors.accent}40`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" fill="white" />
          </svg>
        </div>

        {/* App Name */}
        <h1
          style={{
            fontFamily: fonts.sans,
            fontSize: 56,
            fontWeight: 700,
            color: colors.textPrimary,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          HeyFocus
        </h1>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: 24,
          fontWeight: 500,
          color: colors.textSecondary,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          margin: 0,
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        5개의 슬롯으로 집중하세요
      </p>

      {/* Slot Indicator Animation */}
      <div
        style={{
          opacity: slotsOpacity,
          display: 'flex',
          gap: 12,
          marginTop: 16,
        }}
      >
        {[0, 1, 2, 3, 4].map((index) => {
          const delay = index * 8;
          const dotOpacity = interpolate(
            frame,
            [TAGLINE_APPEAR + 60 + delay, TAGLINE_APPEAR + 80 + delay],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const dotScale = interpolate(
            frame,
            [TAGLINE_APPEAR + 60 + delay, TAGLINE_APPEAR + 80 + delay],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.back(2)) }
          );

          return (
            <div
              key={index}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: index === 0 ? colors.accent : colors.textTertiary,
                opacity: dotOpacity,
                transform: `scale(${dotScale})`,
                boxShadow: index === 0 ? `0 0 20px ${colors.accent}` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 14,
          color: colors.textTertiary,
          opacity: interpolate(
            frame,
            [TAGLINE_APPEAR + 90, TAGLINE_APPEAR + 110],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
          marginTop: 32,
          letterSpacing: '0.05em',
        }}
      >
        당신의 멘탈 스레드를 관리하세요
      </p>
    </AbsoluteFill>
  );
};
