import { interpolate, Easing } from 'remotion';

/**
 * 전환 효과를 위한 유틸리티
 */

// 페이드 인 효과
export const fadeIn = (
  frame: number,
  startFrame: number,
  duration = 15
): number => {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
};

// 페이드 아웃 효과
export const fadeOut = (
  frame: number,
  startFrame: number,
  duration = 15
): number => {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
};

// 슬라이드 인 (위에서 아래로)
export const slideInFromTop = (
  frame: number,
  startFrame: number,
  distance = 50,
  duration = 20
): number => {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [-distance, 0],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );
};

// 슬라이드 인 (왼쪽에서 오른쪽으로)
export const slideInFromLeft = (
  frame: number,
  startFrame: number,
  distance = 50,
  duration = 20
): number => {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [-distance, 0],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );
};

// 스케일 인 효과
export const scaleIn = (
  frame: number,
  startFrame: number,
  duration = 15
): number => {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0.8, 1],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing: Easing.out(Easing.back(1.5)),
    }
  );
};

// 드래그 애니메이션을 위한 위치 보간
export const dragPosition = (
  frame: number,
  startFrame: number,
  endFrame: number,
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } => {
  const x = interpolate(
    frame,
    [startFrame, endFrame],
    [from.x, to.x],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  );
  const y = interpolate(
    frame,
    [startFrame, endFrame],
    [from.y, to.y],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  );
  return { x, y };
};

// Spring 효과
export const spring = (
  frame: number,
  startFrame: number,
  config = { damping: 12, stiffness: 100 }
): number => {
  const progress = Math.max(0, (frame - startFrame) / 30);
  const { damping, stiffness } = config;

  const decay = Math.exp(-damping * progress / 10);
  const oscillation = Math.cos(Math.sqrt(stiffness) * progress);

  return 1 - decay * oscillation;
};
