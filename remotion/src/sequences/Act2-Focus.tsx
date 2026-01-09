import React from 'react';
import { useCurrentFrame, AbsoluteFill } from 'remotion';
// 실제 앱 컴포넌트 import
import { ActiveSection } from '@app/components/sections/ActiveSection';
import { LaterSection } from '@app/components/sections/LaterSection';
import { AddTaskForm } from '@app/components/sections/AddTaskForm';
import { Header } from '@app/components/sections/Header';
// Mock store
import { setMockState, Task } from '../store/mockStore';
// Remotion 전용
import { AppWindow } from '../components/AppWindow';
import { Cursor, CursorKeyframe, DraggedItem } from '../components/Cursor';
import { getTypedText, getTypingDuration } from '../animations/typing';

// Act 2에서 시작하는 태스크 상태
const INITIAL_TASKS: Task[] = [
  { id: 1, text: '디자인 리뷰', status: 'active', isFocus: false },
  { id: 2, text: '코드 리팩토링', status: 'active', isFocus: false },
  { id: 3, text: '회의 준비', status: 'active', isFocus: false },
  { id: 4, text: '이메일 답장', status: 'active', isFocus: false },
  { id: 5, text: '문서 작성', status: 'active', isFocus: false },
];

// 드래그용 태스크 아이템 컴포넌트
const TaskItemDragged: React.FC<{ text: string }> = ({ text }) => (
  <div
    className="task-item"
    style={{
      border: '2px solid var(--accent)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      transform: 'rotate(-2deg)',
      width: 300,
    }}
  >
    <div className="task-indicator" />
    <span className="task-text">{text}</span>
  </div>
);

// 화면 좌표
const TASK_1_POS = { x: 200, y: 145 };
const TASK_5_POS = { x: 200, y: 285 };
const LATER_SECTION_POS = { x: 200, y: 360 };
const INPUT_POS = { x: 180, y: 480 };

export const Act2Focus: React.FC = () => {
  const frame = useCurrentFrame();

  // 타이밍
  const FOCUS_CLICK = 60;
  const DRAG_START = 150;
  const DRAG_END = 210;
  const DRAG_BACK_START = 270;
  const DRAG_BACK_END = 330;
  const NEW_TASK_TYPE = 360;
  const NEW_TASK_ADD = 390;

  // 현재 상태 계산
  let tasks = [...INITIAL_TASKS];
  let isDraggingToLater = false;
  let isDraggingToActive = false;
  let isLaterExpanded = false;

  // 포커스 설정
  if (frame >= FOCUS_CLICK) {
    tasks = tasks.map((t) => ({ ...t, isFocus: t.id === 1 }));
  }

  // Later로 드래그 중
  if (frame >= DRAG_START && frame < DRAG_END) {
    isDraggingToLater = true;
    tasks = tasks.map((t) =>
      t.id === 5 ? { ...t, status: 'active' as const } : t
    );
  }

  // Later에 도착
  if (frame >= DRAG_END && frame < DRAG_BACK_START) {
    tasks = tasks.map((t) =>
      t.id === 5 ? { ...t, status: 'later' as const } : t
    );
    isLaterExpanded = true;
  }

  // Active로 다시 드래그 중
  if (frame >= DRAG_BACK_START && frame < DRAG_BACK_END) {
    isDraggingToActive = true;
    tasks = tasks.map((t) =>
      t.id === 5 ? { ...t, status: 'later' as const } : t
    );
    isLaterExpanded = true;
  }

  // Active로 돌아옴
  if (frame >= DRAG_BACK_END && frame < NEW_TASK_TYPE) {
    tasks = tasks.map((t) =>
      t.id === 5 ? { ...t, status: 'active' as const } : t
    );
    isLaterExpanded = false;
  }

  // 새 태스크 추가됨
  if (frame >= NEW_TASK_ADD) {
    tasks = [
      ...tasks.map((t) => (t.id === 5 ? { ...t, status: 'later' as const } : t)),
      { id: 6, text: '버그 수정', status: 'later' as const, isFocus: false },
    ];
    isLaterExpanded = true;
  }

  // Mock store 상태 설정
  setMockState({
    tasks,
    isLaterExpanded,
    draggedTaskId: isDraggingToLater ? 5 : isDraggingToActive ? 5 : null,
  });

  // 커서 키프레임
  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 0, x: 300, y: 100 },
    { frame: 40, x: TASK_1_POS.x, y: TASK_1_POS.y },
    { frame: FOCUS_CLICK, x: TASK_1_POS.x, y: TASK_1_POS.y, click: true },
    { frame: 130, x: TASK_5_POS.x, y: TASK_5_POS.y },
    { frame: DRAG_START, x: TASK_5_POS.x, y: TASK_5_POS.y, clickHold: true },
    { frame: DRAG_END - 10, x: LATER_SECTION_POS.x, y: LATER_SECTION_POS.y },
    { frame: DRAG_END, x: LATER_SECTION_POS.x, y: LATER_SECTION_POS.y, release: true },
    { frame: 250, x: LATER_SECTION_POS.x, y: LATER_SECTION_POS.y + 50 },
    { frame: DRAG_BACK_START, x: LATER_SECTION_POS.x, y: LATER_SECTION_POS.y + 50, clickHold: true },
    { frame: DRAG_BACK_END - 10, x: TASK_5_POS.x, y: TASK_5_POS.y },
    { frame: DRAG_BACK_END, x: TASK_5_POS.x, y: TASK_5_POS.y, release: true },
    { frame: 350, x: INPUT_POS.x, y: INPUT_POS.y },
    { frame: NEW_TASK_TYPE, x: INPUT_POS.x, y: INPUT_POS.y, click: true },
    { frame: 450, x: INPUT_POS.x, y: INPUT_POS.y },
  ];

  // 현재 타이핑 텍스트
  let typingText = '';
  const isInputFocused = frame >= NEW_TASK_TYPE && frame < NEW_TASK_ADD;
  if (isInputFocused) {
    const fullText = '버그 수정';
    typingText = getTypedText(fullText, frame, NEW_TASK_TYPE, 3);
  }

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppWindow width={360} height={520} isFocused={true}>
        {/* 실제 앱의 Header 컴포넌트 */}
        <Header />

        {/* Main Content */}
        <main className="main">
          {/* 실제 앱의 ActiveSection 컴포넌트 */}
          <ActiveSection />

          {/* 실제 앱의 LaterSection 컴포넌트 */}
          <LaterSection />

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* 실제 앱의 AddTaskForm 컴포넌트 (controlled mode) */}
          <AddTaskForm value={typingText} isFocused={isInputFocused} />
        </main>
      </AppWindow>

      {/* 드래그 중인 아이템 */}
      <DraggedItem
        startFrame={DRAG_START}
        endFrame={DRAG_END - 5}
        fromX={TASK_5_POS.x - 150}
        fromY={TASK_5_POS.y - 20}
        toX={LATER_SECTION_POS.x - 150}
        toY={LATER_SECTION_POS.y - 20}
        visible={isDraggingToLater}
      >
        <TaskItemDragged text="문서 작성" />
      </DraggedItem>

      <DraggedItem
        startFrame={DRAG_BACK_START}
        endFrame={DRAG_BACK_END - 5}
        fromX={LATER_SECTION_POS.x - 150}
        fromY={LATER_SECTION_POS.y + 30}
        toX={TASK_5_POS.x - 150}
        toY={TASK_5_POS.y - 20}
        visible={isDraggingToActive}
      >
        <TaskItemDragged text="문서 작성" />
      </DraggedItem>

      {/* Cursor */}
      <Cursor keyframes={cursorKeyframes} visible={true} />
    </AbsoluteFill>
  );
};
