# HeyFocus

[English](README.md) | [한국어](README.ko.md)

머릿속 멘탈 스레드를 시각화하는 집중 관리 앱

## 소개

HeyFocus는 현재 진행 중인 일과 처리해야 할 일들을 **멘탈 스레드**로 시각화하여 관리하는 앱입니다.

동시에 최대 5개의 스레드만 "Active" 상태로 유지하도록 제한하여, 너무 많은 일을 벌리지 않도록 **가드레일** 역할을 합니다. 생각이 너무 먼 곳으로 벗어나지 않게 붙잡아주고, 지금 이 순간 집중해야 할 것에 시선을 고정시켜 줍니다.

## 주요 기능

### 태스크 관리
- **Active/Later 분류** - 작업을 "지금 할 것"과 "나중에 할 것"으로 분류
- **5개 작업 제한** - Active 작업은 최대 5개로 제한하여 집중력 유지
- **드래그 앤 드롭** - 작업을 드래그하여 Active/Later 간 이동
- **인라인 편집** - 태스크 더블클릭으로 바로 수정

### 포커스 시스템
- **포커스 모드** - Active 작업 중 하나를 포커스로 설정하여 현재 진행 중인 작업 강조
- **슬롯 인디케이터** - 헤더에 5개 점으로 Active 태스크 현황 시각화
- **자동 포커스 전환** - 포커스된 태스크 완료 시 다음 태스크로 자동 이동

### 윈도우 관리
- **글로벌 단축키** - 어디서든 `Ctrl+F`를 눌러 HeyFocus로 즉시 포커스
- **항상 위에 표시 (Always on Top)** - 다른 창 위에 항상 표시
- **컴팩트 모드** - 최소화된 UI로 화면 공간 절약
- **투명도 조절** - 앱 창의 투명도 조절 (30~100%)
- **자동 크기 조절** - 컨텐츠에 따라 윈도우 높이 자동 조절

### 기타
- **실행 취소** - `Cmd+Z`로 모든 작업 되돌리기 (추가, 삭제, 완료, 이동, 편집 등)
- **활동 로그** - 모든 작업 변경 기록 저장 및 별도 창에서 조회
- **통계** - 완료 수, 포커스 전환 수, 총 이벤트 수 표시

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |
| **Build Tool** | Vite |
| **Backend** | Rust (Tauri 2.0) |
| **Storage** | tauri-plugin-store (로컬 JSON 파일) |

## 시스템 요구사항

- macOS 10.15 이상
- (Windows/Linux 지원 예정)

## 설치 및 실행

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (웹 브라우저)
npm run dev

# Tauri 앱으로 개발 실행
npm run tauri:dev
```

### 프로덕션 빌드

```bash
# Tauri 앱 빌드
npm run tauri:build
```

## 키보드 단축키

### 글로벌 (시스템 전역)

| 단축키 | 동작 |
|--------|------|
| `Ctrl+F` | 어디서든 HeyFocus 윈도우로 포커스 |

### 네비게이션

| 단축키 | 동작 |
|--------|------|
| `↑` / `↓` | Active 태스크 간 이동 (순환) |
| `Cmd+1~5` | Active 태스크 인덱스로 직접 선택 |
| `Escape` | 선택 해제 |
| `Cmd+N` | 태스크 추가 입력창에 포커스 |

### 태스크 조작

| 단축키 | 동작 |
|--------|------|
| `Space` | 선택된 태스크 포커스 토글 |
| `D` | 선택된 태스크 삭제 |
| `L` | 선택된 태스크를 Later로 이동 |
| `I` | 선택된 태스크 편집 모드 진입 |
| `Cmd+Z` | 실행 취소 |

### 윈도우 제어

| 단축키 | 동작 |
|--------|------|
| `Cmd+P` | 항상 위에 표시 토글 |
| `Cmd+M` | 컴팩트 모드 토글 |
| `Cmd+[` | 투명도 5% 감소 |
| `Cmd+]` | 투명도 5% 증가 |
| `Cmd+S` | 설정 패널 열기 |

## 프로젝트 구조

```
heyfocus/
├── src/                          # 프론트엔드 소스
│   ├── components/
│   │   ├── sections/             # 주요 섹션 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── ActiveSection.tsx
│   │   │   ├── LaterSection.tsx
│   │   │   └── AddTaskForm.tsx
│   │   ├── task/                 # 태스크 관련 컴포넌트
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskItem.tsx
│   │   ├── log/                  # 로그 관련 컴포넌트
│   │   │   ├── LogWindow.tsx
│   │   │   └── LogOverlay.tsx
│   │   ├── ui/                   # UI 기본 컴포넌트
│   │   │   ├── Icons.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── SlotIndicator.tsx
│   │   └── Toast.tsx
│   ├── hooks/                    # 커스텀 훅
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useWindowFocus.ts
│   │   └── useWindowResize.ts
│   ├── lib/                      # 유틸리티
│   │   ├── broadcast.ts
│   │   ├── tauri.ts
│   │   └── utils.ts
│   ├── store/                    # 상태 관리
│   │   └── useAppStore.ts
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/                    # Tauri 백엔드
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 라이선스

MIT License
