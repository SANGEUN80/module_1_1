/**
 * @jest-environment jsdom
 * Feature: #001 - 날짜 포맷팅 유틸리티
 * Domain: Utils
 * Method: formatDate
 */

import { formatDate } from '@/lib/utils/formatDate';

describe('formatDate 유틸리티 테스트', () => {
  test('ISO 8601 날짜를 YYYY-MM-DD 형식으로 변환', () => {
    const input = '2025-02-09T14:30:00.000Z';
    const expected = '2025-02-09';

    const result = formatDate(input, 'YYYY-MM-DD');

    expect(result).toBe(expected);
  });

  test('날짜를 YYYY년 MM월 DD일 형식으로 변환', () => {
    const input = '2025-02-09T14:30:00.000Z';
    const expected = '2025년 02월 09일';

    const result = formatDate(input, 'YYYY년 MM월 DD일');

    expect(result).toBe(expected);
  });

  test('잘못된 날짜 입력 시 빈 문자열 반환', () => {
    const input = 'invalid-date';

    const result = formatDate(input);

    expect(result).toBe('');
  });

  test('null 입력 시 빈 문자열 반환', () => {
    const result = formatDate(null);

    expect(result).toBe('');
  });

  test('undefined 입력 시 빈 문자열 반환', () => {
    const result = formatDate(undefined);

    expect(result).toBe('');
  });
});
