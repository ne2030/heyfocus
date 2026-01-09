import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
// 실제 앱 컴포넌트 import
import { ActiveSection } from '@app/components/sections/ActiveSection';
import { LaterSection } from '@app/components/sections/LaterSection';
import { AddTaskForm } from '@app/components/sections/AddTaskForm';
import { Header } from '@app/components/sections/Header';
// Mock store
import { setMockState, Task } from '../store/mockStore';
// Remotion 전용
import { AppWindow } from '../components/AppWindow';
import { Cursor, CursorKeyframe } from '../components/Cursor';

// Act 3에서의 태스크 상태
const INITIAL_TASKS: Task[] = [
  { id: 1, text: '디자인 리뷰', status: 'active', isFocus: true },
  { id: 2, text: '코드 리팩토링', status: 'active', isFocus: false },
  { id: 3, text: '회의 준비', status: 'active', isFocus: false },
  { id: 4, text: '이메일 답장', status: 'active', isFocus: false },
  { id: 5, text: '문서 작성', status: 'active', isFocus: false },
];

const LATER_TASK: Task = { id: 6, text: '버그 수정', status: 'later', isFocus: false };

// 버튼 위치
const PIN_BUTTON = { x: 300, y: 55 };
const COMPACT_BUTTON = { x: 268, y: 55 };
const SETTINGS_BUTTON = { x: 332, y: 55 };
const FIRST_TASK = { x: 200, y: 145 };
const COMPLETE_BUTTON = { x: 320, y: 145 };

export const Act3Concentrate: React.FC = () => {
  const frame = useCurrentFrame();

  // 타이밍
  const PIN_CLICK = 60;
  const COMPACT_CLICK = 150;
  const SETTINGS_CLICK = 240;
  const OPACITY_ADJUST = 270;
  const SETTINGS_CLOSE = 330;
  const TASK_HOVER = 360;
  const TASK_COMPLETE = 400;

  // 상태 계산
  const isPinned = frame >= PIN_CLICK;
  const isCompact = frame >= COMPACT_CLICK;
  const showSettings = frame >= SETTINGS_CLICK && frame < SETTINGS_CLOSE;

  // 투명도 조절 애니메이션
  const windowOpacity =
    frame >= OPACITY_ADJUST
      ? interpolate(frame, [OPACITY_ADJUST, OPACITY_ADJUST + 30], [1, 0.7], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
        })
      : 1;

  // 태스크 완료 처리
  let tasks: Task[];
  if (frame >= TASK_COMPLETE) {
    // 첫 번째 태스크 완료, 두 번째가 포커스
    tasks = INITIAL_TASKS.slice(1).map((t, i) => ({
      ...t,
      isFocus: i === 0,
    }));
  } else {
    tasks = [...INITIAL_TASKS];
  }

  // Mock store 상태 설정
  setMockState({
    tasks: [...tasks, LATER_TASK],
    isAlwaysOnTop: isPinned,
    isCompactMode: isCompact,
    isLaterExpanded: false,
  });

  // 커서 키프레임
  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 0, x: 200, y: 200 },
    { frame: 40, x: PIN_BUTTON.x, y: PIN_BUTTON.y },
    { frame: PIN_CLICK, x: PIN_BUTTON.x, y: PIN_BUTTON.y, click: true },
    { frame: 120, x: COMPACT_BUTTON.x, y: COMPACT_BUTTON.y },
    { frame: COMPACT_CLICK, x: COMPACT_BUTTON.x, y: COMPACT_BUTTON.y, click: true },
    { frame: 210, x: SETTINGS_BUTTON.x, y: SETTINGS_BUTTON.y },
    { frame: SETTINGS_CLICK, x: SETTINGS_BUTTON.x, y: SETTINGS_BUTTON.y, click: true },
    { frame: OPACITY_ADJUST, x: 250, y: 380 },
    { frame: OPACITY_ADJUST + 30, x: 200, y: 380 },
    { frame: SETTINGS_CLOSE, x: SETTINGS_BUTTON.x, y: SETTINGS_BUTTON.y, click: true },
    { frame: TASK_HOVER, x: FIRST_TASK.x, y: FIRST_TASK.y },
    { frame: TASK_COMPLETE - 20, x: COMPLETE_BUTTON.x, y: FIRST_TASK.y },
    { frame: TASK_COMPLETE, x: COMPLETE_BUTTON.x, y: FIRST_TASK.y, click: true },
    { frame: 450, x: COMPLETE_BUTTON.x, y: FIRST_TASK.y },
  ];

  const windowHeight = isCompact ? 280 : 520;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ opacity: windowOpacity }}>
        <AppWindow
          width={360}
          height={windowHeight}
          isCompact={isCompact}
          isPinned={isPinned}
          isFocused={true}
        >
          {/* 실제 앱의 Header 컴포넌트 */}
          <Header />

          {/* Main Content */}
          <main
            className="main"
            style={{ padding: isCompact ? '8px 16px' : 16, gap: isCompact ? 8 : 20 }}
          >
            {/* 실제 앱의 ActiveSection 컴포넌트 */}
            <ActiveSection />

            {/* Later Section (hidden in compact mode) */}
            {!isCompact && <LaterSection />}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Add Task Form (hidden in compact mode) */}
            {!isCompact && <AddTaskForm />}
          </main>
        </AppWindow>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            bottom: 180,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 12,
            padding: 16,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            OPACITY
          </span>
          <div
            style={{
              width: 140,
              height: 4,
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${((windowOpacity - 0.3) / 0.7) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--accent)',
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `${((windowOpacity - 0.3) / 0.7) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                backgroundColor: 'var(--accent)',
                borderRadius: '50%',
                boxShadow: '0 0 12px rgba(249, 115, 22, 0.4)',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--accent)',
              minWidth: 40,
              textAlign: 'right',
            }}
          >
            {Math.round(windowOpacity * 100)}%
          </span>
        </div>
      )}

      {/* Cursor */}
      <Cursor keyframes={cursorKeyframes} visible={true} />
    </AbsoluteFill>
  );
};
