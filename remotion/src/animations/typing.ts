import { interpolate } from 'remotion';

/**
 * 타이핑 효과를 위한 유틸리티
 */

// 현재 프레임에서 표시할 텍스트 길이 계산
export const getTypedText = (
  text: string,
  frame: number,
  startFrame: number,
  framesPerChar = 2
): string => {
  const elapsed = frame - startFrame;
  if (elapsed < 0) return '';

  const charCount = Math.floor(elapsed / framesPerChar);
  return text.slice(0, Math.min(charCount, text.length));
};

// 타이핑이 완료되었는지 확인
export const isTypingComplete = (
  text: string,
  frame: number,
  startFrame: number,
  framesPerChar = 2
): boolean => {
  const elapsed = frame - startFrame;
  const charCount = Math.floor(elapsed / framesPerChar);
  return charCount >= text.length;
};

// 타이핑에 필요한 총 프레임 수 계산
export const getTypingDuration = (text: string, framesPerChar = 2): number => {
  return text.length * framesPerChar;
};

// 커서 깜빡임 효과
export const getCursorOpacity = (frame: number, blinkInterval = 15): number => {
  return Math.floor(frame / blinkInterval) % 2 === 0 ? 1 : 0;
};
