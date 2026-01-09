import React from 'react';
import { useCurrentFrame, interpolate, Easing, spring } from 'remotion';
import { colors } from '../styles';

export interface CursorKeyframe {
  frame: number;
  x: number;
  y: number;
  click?: boolean;      // 클릭 이벤트
  clickHold?: boolean;  // 클릭 유지 (드래그 시작)
  release?: boolean;    // 드래그 끝
}

interface CursorProps {
  keyframes: CursorKeyframe[];
  visible?: boolean;
}

export const Cursor: React.FC<CursorProps> = ({
  keyframes,
  visible = true,
}) => {
  const frame = useCurrentFrame();

  if (!visible || keyframes.length === 0) return null;

  // 현재 위치 계산 (spring 기반 부드러운 이동)
  let currentX = keyframes[0].x;
  let currentY = keyframes[0].y;
  let isClicking = false;
  let isDragging = false;
  let showClickRipple = false;
  let clickRippleProgress = 0;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    const nextKf = keyframes[i + 1];

    if (frame >= kf.frame) {
      if (nextKf && frame < nextKf.frame) {
        // 두 키프레임 사이에서 보간
        const duration = nextKf.frame - kf.frame;
        const progress = (frame - kf.frame) / duration;

        // Ease out cubic for smooth movement
        const eased = 1 - Math.pow(1 - progress, 3);

        currentX = kf.x + (nextKf.x - kf.x) * eased;
        currentY = kf.y + (nextKf.y - kf.y) * eased;
      } else if (!nextKf) {
        currentX = kf.x;
        currentY = kf.y;
      }

      // 클릭 상태 확인
      if (kf.click && frame >= kf.frame && frame < kf.frame + 15) {
        isClicking = true;
        showClickRipple = true;
        clickRippleProgress = (frame - kf.frame) / 15;
      }

      // 드래그 상태 확인
      if (kf.clickHold) {
        isDragging = true;
        isClicking = true;
      }
      if (kf.release) {
        isDragging = false;
        isClicking = false;
      }
    }
  }

  // 드래그 중인지 확인 (clickHold와 release 사이)
  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (kf.clickHold && frame >= kf.frame) {
      // release 찾기
      const releaseKf = keyframes.slice(i + 1).find(k => k.release);
      if (releaseKf && frame < releaseKf.frame) {
        isDragging = true;
        isClicking = true;
      }
    }
  }

  const cursorScale = isClicking ? 0.85 : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        transform: `translate(-2px, -2px) scale(${cursorScale})`,
        transition: 'transform 0.08s ease-out',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Click Ripple Effect */}
      {showClickRipple && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `${colors.accent}40`,
            transform: `translate(-50%, -50%) scale(${0.5 + clickRippleProgress * 1.5})`,
            opacity: 1 - clickRippleProgress,
          }}
        />
      )}

      {/* macOS Cursor */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
        }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.86.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.36 2.86a.5.5 0 0 0-.86.35z"
          fill={isDragging ? colors.accent : '#000000'}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Drag indicator */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 10,
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.accent,
            backgroundColor: 'white',
            padding: '2px 6px',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          드래그 중
        </div>
      )}
    </div>
  );
};

// 드래그되는 아이템 컴포넌트
interface DraggedItemProps {
  children: React.ReactNode;
  startFrame: number;
  endFrame: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  visible?: boolean;
}

export const DraggedItem: React.FC<DraggedItemProps> = ({
  children,
  startFrame,
  endFrame,
  fromX,
  fromY,
  toX,
  toY,
  visible = true,
}) => {
  const frame = useCurrentFrame();

  if (!visible || frame < startFrame || frame > endFrame) return null;

  const progress = (frame - startFrame) / (endFrame - startFrame);
  const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

  const currentX = fromX + (toX - fromX) * eased;
  const currentY = fromY + (toY - fromY) * eased;

  return (
    <div
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        transform: 'rotate(-2deg) scale(1.02)',
        opacity: 0.9,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {children}
    </div>
  );
};
