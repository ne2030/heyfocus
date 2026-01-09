// HeyFocus 색상 및 스타일 상수 - LIGHT MODE

export const colors = {
  // 배경 (라이트 모드)
  bgBase: '#fafafa',
  bgElevated: '#ffffff',
  bgSurface: '#f5f5f5',
  bgHover: '#e5e5e5',

  // 텍스트
  textPrimary: '#0a0a0a',
  textSecondary: '#737373',
  textTertiary: '#a3a3a3',

  // 액센트
  accent: '#f97316',
  accentMuted: 'rgba(249, 115, 22, 0.15)',
  accentMutedSolid: '#fef3e8',

  // 상태
  success: '#22c55e',
  danger: '#ef4444',
  info: '#3b82f6',

  // 보더
  border: 'rgba(0, 0, 0, 0.06)',
  borderSubtle: 'rgba(0, 0, 0, 0.03)',
};

export const fonts = {
  sans: "'IBM Plex Sans', -apple-system, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

// 비디오 설정 - 앱 크기에 맞춤
export const VIDEO_CONFIG = {
  fps: 30,
  width: 420,   // 앱 너비 + 약간의 여백
  height: 580,  // 앱 높이 + 약간의 여백
  durationInFrames: 2400, // 80초
};

// 앱 창 크기
export const APP_SIZE = {
  width: 360,
  height: 520,
};

// Act별 프레임 범위
export const ACTS = {
  act1: { start: 0, end: 450 },      // 0-15초
  act2: { start: 450, end: 900 },    // 15-30초
  act3: { start: 900, end: 1350 },   // 30-45초
  act4: { start: 1350, end: 2100 },  // 45-70초
  act5: { start: 2100, end: 2400 },  // 70-80초
};
