import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Easing } from 'remotion';
// 실제 앱 컴포넌트 import
import { ActiveSection } from '@app/components/sections/ActiveSection';
import { Header } from '@app/components/sections/Header';
// Mock store
import { setMockState, Task } from '../store/mockStore';
// Remotion 전용
import { AppWindow } from '../components/AppWindow';
import { Cursor, CursorKeyframe } from '../components/Cursor';

// Act 4에서의 태스크 상태
const TASKS: Task[] = [
  { id: 2, text: '코드 리팩토링', status: 'active', isFocus: true },
  { id: 3, text: '회의 준비', status: 'active', isFocus: false },
  { id: 4, text: '이메일 답장', status: 'active', isFocus: false },
  { id: 5, text: '문서 작성', status: 'active', isFocus: false },
];

// Mock 로그 데이터
const MOCK_LOGS = [
  { time: '14:32', event: 'TASK_DONE', task: '디자인 리뷰' },
  { time: '14:15', event: 'SWITCH_FOCUS', task: '디자인 리뷰' },
  { time: '13:45', event: 'TASK_CREATED', task: '문서 작성' },
  { time: '13:42', event: 'TASK_CREATED', task: '이메일 답장' },
  { time: '13:40', event: 'TASK_CREATED', task: '회의 준비' },
  { time: '13:38', event: 'TASK_CREATED', task: '코드 리팩토링' },
  { time: '13:35', event: 'TASK_CREATED', task: '디자인 리뷰' },
];

// 버튼 위치
const SETTINGS_BUTTON = { x: 332, y: 55 };
const LOG_BUTTON = { x: 170, y: 250 };
const STATS_BUTTON = { x: 250, y: 250 };

export const Act4Review: React.FC = () => {
  const frame = useCurrentFrame();

  // 타이밍
  const SETTINGS_CLICK = 60;
  const LOG_BUTTON_CLICK = 120;
  const LOG_WINDOW_OPEN = 150;
  const LOG_SCROLL = 210;
  const STATS_BUTTON_CLICK = 240;
  const STATS_WINDOW_OPEN = 270;
  const CHART_BROWSE = 330;
  const HEATMAP_VIEW = 510;

  // 창 표시 상태
  const showSettingsOverlay = frame >= SETTINGS_CLICK && frame < LOG_WINDOW_OPEN;
  const showLogWindow = frame >= LOG_WINDOW_OPEN;
  const showStatsWindow = frame >= STATS_WINDOW_OPEN;

  // Mock store 상태 설정
  setMockState({
    tasks: TASKS,
    isLaterExpanded: false,
  });

  // 로그 창 애니메이션
  const logWindowX = interpolate(
    frame,
    [LOG_WINDOW_OPEN, LOG_WINDOW_OPEN + 30],
    [100, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic) }
  );
  const logWindowOpacity = interpolate(
    frame,
    [LOG_WINDOW_OPEN, LOG_WINDOW_OPEN + 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // 통계 창 애니메이션
  const statsWindowX = interpolate(
    frame,
    [STATS_WINDOW_OPEN, STATS_WINDOW_OPEN + 30],
    [-100, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic) }
  );
  const statsWindowOpacity = interpolate(
    frame,
    [STATS_WINDOW_OPEN, STATS_WINDOW_OPEN + 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // 커서 키프레임
  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 0, x: 200, y: 200 },
    { frame: 40, x: SETTINGS_BUTTON.x, y: SETTINGS_BUTTON.y },
    { frame: SETTINGS_CLICK, x: SETTINGS_BUTTON.x, y: SETTINGS_BUTTON.y, click: true },
    { frame: 100, x: LOG_BUTTON.x, y: LOG_BUTTON.y },
    { frame: LOG_BUTTON_CLICK, x: LOG_BUTTON.x, y: LOG_BUTTON.y, click: true },
    { frame: LOG_WINDOW_OPEN + 30, x: 500, y: 300 },
    { frame: LOG_SCROLL, x: 500, y: 350 },
    { frame: STATS_BUTTON_CLICK, x: STATS_BUTTON.x, y: STATS_BUTTON.y, click: true },
    { frame: STATS_WINDOW_OPEN + 30, x: 100, y: 300 },
    { frame: CHART_BROWSE, x: 150, y: 350 },
    { frame: HEATMAP_VIEW, x: 150, y: 450 },
    { frame: 750, x: 150, y: 450 },
  ];

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      {/* Main App Window - 실제 컴포넌트 사용 */}
      <AppWindow width={360} height={450} isFocused={!showLogWindow && !showStatsWindow}>
        <Header />
        <main className="main">
          <ActiveSection />
        </main>
      </AppWindow>

      {/* Log Window */}
      {showLogWindow && (
        <div
          style={{
            opacity: logWindowOpacity,
            transform: `translateX(${logWindowX}px)`,
          }}
        >
          <LogWindow logs={MOCK_LOGS} />
        </div>
      )}

      {/* Stats Window */}
      {showStatsWindow && (
        <div
          style={{
            opacity: statsWindowOpacity,
            transform: `translateX(${statsWindowX}px)`,
          }}
        >
          <StatsWindow currentView={frame >= HEATMAP_VIEW ? 'heatmap' : 'timeline'} />
        </div>
      )}

      {/* Settings Overlay */}
      {showSettingsOverlay && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 12,
            padding: 20,
            border: '1px solid var(--border)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <SettingsButton icon="log" label="Log" />
            <SettingsButton icon="stats" label="Stats" />
          </div>
        </div>
      )}

      {/* Cursor */}
      <Cursor keyframes={cursorKeyframes} visible={true} />
    </AbsoluteFill>
  );
};

// Log Window Component
const LogWindow: React.FC<{ logs: typeof MOCK_LOGS }> = ({ logs }) => (
  <div className="log-panel">
    <div className="log-header">
      <span className="log-title">Activity Log</span>
      <div className="log-stats">
        <span className="log-stat">
          Done: <span className="success">1</span>
        </span>
        <span className="log-stat">
          Switches: <span className="accent">1</span>
        </span>
      </div>
    </div>
    <div className="log-content">
      {logs.map((log, i) => (
        <div key={i} className="log-entry">
          <span className="log-time">{log.time}</span>
          <span className={`log-event ${log.event}`}>{log.event.replace('_', ' ')}</span>
          <span className="log-task">{log.task}</span>
        </div>
      ))}
    </div>
  </div>
);

// Stats Window Component
const StatsWindow: React.FC<{ currentView: 'timeline' | 'heatmap' }> = ({ currentView }) => (
  <div className="stats-panel">
    <div className="stats-header">
      <div className="stats-header-content">
        <span className="stats-badge">LIVE</span>
        <span className="stats-title">Today's Stats</span>
      </div>
    </div>

    <div className="stats-content">
      {/* Daily Score */}
      <div className="score-card">
        <div className="score-ring-container">
          <svg className="score-ring" width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeDasharray={`${0.75 * 2 * Math.PI * 35} ${2 * Math.PI * 35}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="score-value-container">
            <span className="score-value">75</span>
          </div>
        </div>
        <div className="score-stats">
          <StatItem label="Completed" value="1" />
          <StatItem label="Focus Time" value="45m" />
          <StatItem label="Switches" value="1" />
          <StatItem label="Avg Session" value="45m" />
        </div>
      </div>

      {/* Heatmap or Timeline */}
      {currentView === 'heatmap' ? (
        <div className="heatmap">
          <span className="heatmap-title">Activity Heatmap</span>
          <div className="heatmap-grid">
            {['9am', '10am', '11am', '12pm', '1pm', '2pm'].map((hour, i) => (
              <div
                key={hour}
                className="heatmap-cell"
                style={{
                  backgroundColor:
                    i === 5
                      ? 'var(--accent)'
                      : i >= 3
                        ? `rgba(249, 115, 22, ${0.3 + i * 0.1})`
                        : 'var(--bg-hover)',
                }}
              >
                <span className="heatmap-hour">{hour}</span>
                <span className="heatmap-count">{i >= 3 ? i - 2 : 0}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="timeline">
          <span className="timeline-title">Focus Timeline</span>
          <TimelineItem task="디자인 리뷰" color="var(--accent)" width={80} />
          <TimelineItem task="코드 리팩토링" color="var(--info)" width={20} />
        </div>
      )}
    </div>
  </div>
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="score-stat-value">{value}</span>
    <span className="score-stat-label">{label}</span>
  </div>
);

const TimelineItem: React.FC<{ task: string; color: string; width: number }> = ({
  task,
  color,
  width,
}) => (
  <div className="timeline-item">
    <div className="timeline-dot" style={{ backgroundColor: color }} />
    <span className="timeline-name">{task}</span>
    <div className="timeline-bar">
      <div
        className="timeline-fill"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}50`,
        }}
      />
    </div>
  </div>
);

const SettingsButton: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div
    style={{
      padding: '12px 20px',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
    }}
  >
    {icon === 'log' ? (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-secondary)"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ) : (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-secondary)"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )}
    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);
