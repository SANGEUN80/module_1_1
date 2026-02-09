# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm run dev          # 개발 서버 시작 (Turbopack, localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
```

## 프로젝트 개요

LogWatch Admin - 실시간 로그 수집, 분석 및 모니터링을 위한 웹 기반 어드민 대시보드

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| 번들러 | Turbopack |

## 아키텍처

**Next.js 16 App Router** 기반의 FE + BE 통합 프로젝트. TypeScript 전체 적용, Tailwind CSS v4로 스타일링.

### 라우팅 구조

- **`src/app/(dashboard)/`** — 대시보드 페이지 라우트 그룹. `Sidebar` + `Header`가 포함된 공유 레이아웃 사용. 루트 경로 `/`가 대시보드를 렌더링함.
- **`src/app/(auth)/`** — 인증 페이지 라우트 그룹 (로그인, 회원가입). 사이드바 없는 중앙 정렬 레이아웃 사용.
- **`src/app/api/`** — 백엔드 API 라우트 핸들러. 각 엔드포인트는 `route.ts` 파일에서 HTTP 메서드 함수(`GET`, `POST` 등)를 export.

라우트 그룹 `(dashboard)`와 `(auth)`는 URL에 **나타나지 않으며**, 어떤 레이아웃으로 감쌀지만 결정함.

### 주요 페이지 및 라우트

| 경로 | 설명 | 레이아웃 |
|------|------|----------|
| `/` | 대시보드 메인 | Sidebar + Header |
| `/logs` | 로그 목록 및 검색 | Sidebar + Header |
| `/alerts` | 알림 관리 | Sidebar + Header |
| `/settings` | 시스템 설정 | Sidebar + Header |
| `/login` | 로그인 | 중앙 정렬 (인증) |
| `/register` | 회원가입 | 중앙 정렬 (인증) |

### 디렉토리 구조

```
src/
├── app/              # Next.js App Router (페이지, 레이아웃, API 라우트)
│   ├── (dashboard)/  # 대시보드 라우트 그룹 (루트 경로 /)
│   ├── (auth)/       # 인증 라우트 그룹 (로그인, 회원가입)
│   └── api/          # API 라우트 핸들러
├── components/
│   ├── ui/           # 재사용 UI 프리미티브 (Button, Input, Card 등)
│   ├── layout/       # 셸 컴포넌트 (Sidebar, Header)
│   └── features/     # 기능별 복합 컴포넌트
├── lib/              # 공유 유틸리티, 상수, 헬퍼
├── hooks/            # 커스텀 React 훅
├── types/            # TypeScript 타입 정의
├── services/         # API 클라이언트 함수 / 외부 서비스 연동
└── styles/           # 추가 글로벌 스타일 (Tailwind 외)
```

## 주요 기능

### 대시보드
- 실시간 로그 스트림 모니터링
- 로그 레벨별 필터링 (ERROR, WARN, INFO, DEBUG)
- 시간대별 로그 발생 추이 차트
- 핵심 지표 요약 카드

### 로그 검색 및 분석
- 키워드 기반 로그 검색
- 날짜/시간 범위 필터
- 로그 소스별 분류
- 상세 로그 뷰어

### 알림 관리
- 임계값 기반 알림 규칙 설정
- 알림 이력 조회
- 알림 채널 관리 (이메일, 슬랙 등)

### 시스템 관리
- 사용자 계정 관리
- 로그 수집 소스 설정
- 보존 정책 관리

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/logs` | 로그 목록 조회 |
| `GET` | `/api/logs/:id` | 로그 상세 조회 |
| `GET` | `/api/alerts` | 알림 규칙 목록 |
| `POST` | `/api/alerts` | 알림 규칙 생성 |
| `GET` | `/api/stats` | 대시보드 통계 데이터 |
| `POST` | `/api/auth/login` | 로그인 |
| `POST` | `/api/auth/register` | 회원가입 |

## 코딩 컨벤션

- **import 별칭**: `@/*`는 `src/*`에 매핑 (예: `import { Sidebar } from "@/components/layout/Sidebar"`)
- **컴포넌트 export**: named export 사용 (`export function Button`), default export 사용하지 않음
- **API 응답**: `next/server`의 `NextResponse.json()`으로 반환
  ```typescript
  import { NextResponse } from "next/server";
  export async function GET() {
    return NextResponse.json({ logs: [] });
  }
  ```
- 사용자 대면 문자열과 주석에 한국어 사용 가능
