/**
 * @jest-environment jsdom
 * Feature: #004 - Log API 서비스
 * Domain: Services/API
 * Method: fetchLogs, fetchLogById
 */

import { fetchLogs, fetchLogById, createAlert } from '@/services/logApi';

// fetch 모킹
global.fetch = jest.fn();

describe('Log API 서비스 테스트', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchLogs', () => {
    test('로그 목록을 성공적으로 가져옴', async () => {
      const mockLogs = [
        { id: 1, level: 'ERROR', message: 'Error occurred' },
        { id: 2, level: 'INFO', message: 'Info message' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: mockLogs }),
      });

      const result = await fetchLogs();

      expect(fetch).toHaveBeenCalledWith('/api/logs');
      expect(result).toEqual({ logs: mockLogs });
    });

    test('쿼리 파라미터와 함께 요청 가능', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: [] }),
      });

      await fetchLogs({ level: 'ERROR', limit: 10 });

      expect(fetch).toHaveBeenCalledWith('/api/logs?level=ERROR&limit=10');
    });

    test('API 오류 시 에러를 throw함', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(fetchLogs()).rejects.toThrow('Failed to fetch logs');
    });
  });

  describe('fetchLogById', () => {
    test('특정 로그를 ID로 가져옴', async () => {
      const mockLog = { id: 1, level: 'ERROR', message: 'Error occurred' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLog,
      });

      const result = await fetchLogById(1);

      expect(fetch).toHaveBeenCalledWith('/api/logs/1');
      expect(result).toEqual(mockLog);
    });

    test('존재하지 않는 로그 ID 조회 시 404 에러', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchLogById(999)).rejects.toThrow('Failed to fetch log');
    });
  });

  describe('createAlert', () => {
    test('알림 규칙을 성공적으로 생성함', async () => {
      const alertData = {
        name: 'High Error Rate',
        threshold: 10,
        channel: 'email',
      };

      const mockResponse = { id: 1, ...alertData };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createAlert(alertData);

      expect(fetch).toHaveBeenCalledWith('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      expect(result).toEqual(mockResponse);
    });

    test('유효하지 않은 데이터로 생성 시 400 에러', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(createAlert({})).rejects.toThrow('Failed to create alert');
    });
  });
});
