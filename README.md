# HeyFocus

머릿속 멘탈 스레드를 시각화하는 집중 관리 앱

## 소개

HeyFocus는 현재 진행 중인 일과 처리해야 할 일들을 **멘탈 스레드**로 시각화하여 관리하는 앱입니다.

동시에 최대 5개의 스레드만 "Active" 상태로 유지하도록 제한하여, 너무 많은 일을 벌리지 않도록 **가드레일** 역할을 합니다. 생각이 너무 먼 곳으로 벗어나지 않게 붙잡아주고, 지금 이 순간 집중해야 할 것에 시선을 고정시켜 줍니다.

## 주요 기능

- **Active/Later 분류** - 작업을 "지금 할 것"과 "나중에 할 것"으로 분류
- **5개 작업 제한** - Active 작업은 최대 5개로 제한하여 집중력 유지
- **포커스 모드** - Active 작업 중 하나를 포커스로 설정하여 현재 진행 중인 작업 강조
- **드래그 앤 드롭** - 작업을 드래그하여 Active/Later 간 이동
- **작업 로그** - 모든 작업 변경 기록 저장 및 조회
- **실행 취소** - `Cmd+Z`로 이전 작업 되돌리기
- **Always on Top** - 다른 창 위에 항상 표시
- **컴팩트 모드** - 최소화된 UI로 화면 공간 절약
- **투명도 조절** - 앱 창의 투명도 조절

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Rust (Tauri 2.0)
- **Storage**: tauri-plugin-store (로컬 JSON 파일)

## 시스템 요구사항

- macOS 10.15 이상
- (Windows/Linux 지원 예정)

## 설치 및 실행

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

## 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Cmd+Z` | 실행 취소 |
| `Enter` | 새 작업 추가 |

## 프로젝트 구조

```
heyfocus/
├── src/                    # 프론트엔드 소스
│   ├── index.html         # 메인 HTML
│   └── main.js            # 앱 로직
├── src-tauri/             # Tauri 백엔드
│   ├── src/
│   │   ├── main.rs        # 앱 진입점
│   │   └── lib.rs         # 핵심 로직
│   ├── Cargo.toml         # Rust 의존성
│   └── tauri.conf.json    # Tauri 설정
└── package.json
```

## 라이선스

MIT License
