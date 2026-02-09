# Frontend Test Suite

LogWatch Admin 프로젝트의 프론트엔드 유닛 테스트 모음입니다.

## 디렉토리 구조

```
frontend/test/
├── components/       # UI 컴포넌트 테스트
│   └── Button.test.jsx
├── hooks/            # 커스텀 React 훅 테스트
│   └── useDebounce.test.js
├── services/         # API 서비스 테스트
│   └── logApi.test.js
└── utils/            # 유틸리티 함수 테스트
    └── formatDate.test.js
```

## 테스트 실행

### 기본 테스트 실행
```bash
npm test
```

### Watch 모드 (파일 변경 감지)
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

## 작성된 테스트

### 1. Utils - formatDate
- **Feature**: #001
- **파일**: `utils/formatDate.test.js`
- **테스트 수**: 5개
- **설명**: 날짜 포맷팅 유틸리티 함수 테스트

### 2. Components - Button
- **Feature**: #002
- **파일**: `components/Button.test.jsx`
- **테스트 수**: 5개
- **설명**: 재사용 가능한 Button 컴포넌트 테스트

### 3. Hooks - useDebounce
- **Feature**: #003
- **파일**: `hooks/useDebounce.test.js`
- **테스트 수**: 4개
- **설명**: 입력 디바운싱을 위한 커스텀 훅 테스트

### 4. Services - logApi
- **Feature**: #004
- **파일**: `services/logApi.test.js`
- **테스트 수**: 7개
- **설명**: 로그 API 통신 서비스 테스트

## 테스트 커버리지 목표

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 테스트 작성 가이드

### 1. 파일 명명 규칙
- 테스트 파일은 `*.test.js` 또는 `*.test.jsx` 형식
- 원본 파일과 동일한 이름 + `.test` 확장자

### 2. 테스트 구조
```javascript
/**
 * @jest-environment jsdom
 * Feature: #XXX - 기능 이름
 * Domain: 도메인명
 * Method: 메소드명
 */

describe('테스트 그룹명', () => {
  test('테스트 케이스 설명', () => {
    // Arrange (준비)
    // Act (실행)
    // Assert (검증)
  });
});
```

### 3. 모킹
- API 호출: `global.fetch = jest.fn()`
- 컴포넌트: `jest.mock('@/components/...')`
- 타이머: `jest.useFakeTimers()`

### 4. Testing Library 활용
```javascript
import { render, screen, fireEvent } from '@testing-library/react';

// 렌더링
render(<Component />);

// 요소 찾기
const button = screen.getByRole('button', { name: /클릭/i });

// 이벤트 발생
fireEvent.click(button);

// 검증
expect(button).toBeInTheDocument();
```

## 테스트 결과 문서

테스트 실행 결과는 다음 위치에 기록됩니다:
- **문서 경로**: `.claude/docs/frontend/test.md`
- **형식**: 실행일시 / 도메인 / 메소드 / 테스트 결과 (체크박스)

## 의존성

```json
{
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/react": "^14.1.2",
  "@testing-library/user-event": "^14.5.1",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0"
}
```

## 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Testing Library 공식 문서](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing 가이드](https://nextjs.org/docs/testing)
