import React from 'react';
import { useCurrentFrame, AbsoluteFill } from 'remotion';
// 실제 앱 컴포넌트 import
import { ActiveSection } from '@app/components/sections/ActiveSection';
import { AddTaskForm } from '@app/components/sections/AddTaskForm';
import { Header } from '@app/components/sections/Header';
// Mock store 상태 설정
import { setMockState, Task } from '../store/mockStore';
// Remotion 전용
import { AppWindow } from '../components/AppWindow';
import { Cursor, CursorKeyframe } from '../components/Cursor';
import { getTypedText, getTypingDuration } from '../animations/typing';
import { fadeIn, scaleIn } from '../animations/transitions';

// 태스크 텍스트
const TASK_TEXTS = [
  '디자인 리뷰',
  '코드 리팩토링',
  '회의 준비',
  '이메일 답장',
  '문서 작성',
];

export const Act1Start: React.FC = () => {
  const frame = useCurrentFrame();

  // 타이밍 계산 (프레임)
  const WINDOW_APPEAR = 0;
  const FIRST_TASK_START = 90; // 3초
  const TASK_INTERVAL = 60; // 각 태스크 추가 간격 (2초)

  // 윈도우 나타나기
  const windowOpacity = fadeIn(frame, WINDOW_APPEAR, 20);
  const windowScale = scaleIn(frame, WINDOW_APPEAR, 20);

  // 각 태스크 추가 시점 계산
  const taskTimings = TASK_TEXTS.map((_, i) => FIRST_TASK_START + i * TASK_INTERVAL);

  // 현재 표시할 태스크 수 계산
  const tasks: Task[] = [];
  let currentTypingText = '';
  let isInputFocused = false;

  taskTimings.forEach((timing, index) => {
    const typingDuration = getTypingDuration(TASK_TEXTS[index], 3);
    const typingEndFrame = timing + typingDuration;
    const addedFrame = typingEndFrame + 10;

    if (frame >= addedFrame) {
      tasks.push({
        id: index + 1,
        text: TASK_TEXTS[index],
        status: 'active',
        isFocus: false,
      });
    } else if (frame >= timing && frame < addedFrame) {
      currentTypingText = getTypedText(TASK_TEXTS[index], frame, timing, 3);
      isInputFocused = true;
    }
  });

  // Mock store 상태 설정 - 실제 앱 컴포넌트가 이 상태를 사용
  setMockState({
    tasks,
    isLaterExpanded: false,
  });

  // 입력창 위치
  const inputX = 180;
  const inputY = 480;

  // 커서 키프레임
  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 30, x: 300, y: 150 },
    { frame: 60, x: inputX, y: inputY, click: true },
    { frame: 450, x: inputX, y: inputY },
  ];

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity: windowOpacity,
          transform: `scale(${windowScale})`,
        }}
      >
        <AppWindow width={360} height={520} isFocused={true}>
          {/* 실제 앱의 Header 컴포넌트 */}
          <Header />

          {/* Main Content */}
          <main className="main">
            {/* 실제 앱의 ActiveSection 컴포넌트 */}
            <ActiveSection />

            {/* Later Section (collapsed) */}
            <div className="section later">
              <div className="later-header">
                <div className="later-toggle">
                  <svg
                    className="chevron-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span className="section-title">LATER</span>
                </div>
                <span className="section-meta">0</span>
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* 실제 앱의 AddTaskForm 컴포넌트 */}
            <AddTaskForm />
          </main>
        </AppWindow>
      </div>

      {/* Cursor */}
      <Cursor keyframes={cursorKeyframes} visible={frame > 30} />
    </AbsoluteFill>
  );
};
