import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/api/apiClient';
import { logsApi, parseLogLines, deriveCountsFromRaw } from '../../logs/api/logsApi';

vi.mock('@/api/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('parseLogLines', () => {
  it('parses valid log lines correctly', () => {
    const input = [
      '2026-03-23 10:00:00 | INFO | system | Started successfully',
      '2026-03-23 10:01:00 | WARNING | auth | Token is close to expiry',
      '2026-03-23 10:02:00 | ERROR | db | Connection failed',
    ];

    const result = parseLogLines(input);

    expect(result).toEqual([
      {
        timestamp: '2026-03-23 10:00:00',
        level: 'INFO',
        source: 'system',
        message: 'Started successfully',
      },
      {
        timestamp: '2026-03-23 10:01:00',
        level: 'WARNING',
        source: 'auth',
        message: 'Token is close to expiry',
      },
      {
        timestamp: '2026-03-23 10:02:00',
        level: 'ERROR',
        source: 'db',
        message: 'Connection failed',
      },
    ]);
  });

  it('ignores invalid log lines', () => {
    const input = [
      '2026-03-23 10:00:00 | INFO | system | Valid message',
      'invalid line',
      'another bad line',
    ];

    const result = parseLogLines(input);

    expect(result).toEqual([
      {
        timestamp: '2026-03-23 10:00:00',
        level: 'INFO',
        source: 'system',
        message: 'Valid message',
      },
    ]);
  });

  it('joins message correctly when message contains pipe characters', () => {
    const input = [
      '2026-03-23 10:00:00 | INFO | api | Request payload | user=abc | status=ok',
    ];

    const result = parseLogLines(input);

    expect(result).toEqual([
      {
        timestamp: '2026-03-23 10:00:00',
        level: 'INFO',
        source: 'api',
        message: 'Request payload | user=abc | status=ok',
      },
    ]);
  });

  it('returns empty array when all log lines are invalid', () => {
    const result = parseLogLines(['bad', 'wrong', 'oops']);
    expect(result).toEqual([]);
  });

  it('trims whitespace from parsed parts', () => {
    const input = [
      ' 2026-03-23 10:00:00  |  INFO  |  worker  |  Job finished successfully  ',
    ];

    const result = parseLogLines(input);

    expect(result).toEqual([
      {
        timestamp: '2026-03-23 10:00:00',
        level: 'INFO',
        source: 'worker',
        message: 'Job finished successfully',
      },
    ]);
  });
});

describe('deriveCountsFromRaw', () => {
  it('counts INFO, WARNING and ERROR lines correctly', () => {
    const input = [
      '2026-03-23 10:00:00 | INFO | system | Started',
      '2026-03-23 10:01:00 | WARNING | auth | Expiring soon',
      '2026-03-23 10:02:00 | ERROR | db | Failed',
      '2026-03-23 10:03:00 | INFO | api | Done',
    ];

    const result = deriveCountsFromRaw(input);

    expect(result).toEqual({
      info: 2,
      warnings: 1,
      errors: 1,
    });
  });

  it('returns zero counts when input is empty', () => {
    expect(deriveCountsFromRaw([])).toEqual({
      info: 0,
      warnings: 0,
      errors: 0,
    });
  });

  it('ignores lines that do not match supported levels', () => {
    const input = [
      '2026-03-23 10:00:00 | DEBUG | system | Debugging',
      'random text',
      '2026-03-23 10:01:00 | TRACE | api | Tracing',
    ];

    const result = deriveCountsFromRaw(input);

    expect(result).toEqual({
      info: 0,
      warnings: 0,
      errors: 0,
    });
  });
});

describe('logsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHourlyLogs maps api response correctly', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        data: [
          {
            file_key: 'log-1',
            created_at: '2026-03-23T10:00:00Z',
            line_count: 25,
          },
          {
            file_key: 'log-2',
            created_at: '2026-03-23T11:00:00Z',
            line_count: 8,
          },
        ],
      },
    });

    const result = await logsApi.getHourlyLogs();

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/logs/hourly');
    expect(result).toEqual([
      {
        file_key: 'log-1',
        id: 'log-1',
        created_at: '2026-03-23T10:00:00Z',
        lines: [],
        linesLoaded: false,
        info: 0,
        warnings: 0,
        errors: 0,
        total: 25,
      },
      {
        file_key: 'log-2',
        id: 'log-2',
        created_at: '2026-03-23T11:00:00Z',
        lines: [],
        linesLoaded: false,
        info: 0,
        warnings: 0,
        errors: 0,
        total: 8,
      },
    ]);
  });

  it('getHourlyLogs returns empty array when api returns no data', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        data: [],
      },
    });

    const result = await logsApi.getHourlyLogs();

    expect(result).toEqual([]);
  });

  it('getHourlyLogPage fetches paginated log details and parses lines', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        data: [
          '2026-03-23 10:00:00 | INFO | system | Started successfully',
          '2026-03-23 10:01:00 | WARNING | auth | Token expiring soon',
          'bad line',
          '2026-03-23 10:02:00 | ERROR | db | Connection failed',
        ],
        total: 42,
        count: 4,
      },
    });

    const result = await logsApi.getHourlyLogPage('log-1', 20);

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/logs/hourly/log-1', {
      params: { skip: 20, limit: 10 },
    });

    expect(result).toEqual({
      lines: [
        {
          timestamp: '2026-03-23 10:00:00',
          level: 'INFO',
          source: 'system',
          message: 'Started successfully',
        },
        {
          timestamp: '2026-03-23 10:01:00',
          level: 'WARNING',
          source: 'auth',
          message: 'Token expiring soon',
        },
        {
          timestamp: '2026-03-23 10:02:00',
          level: 'ERROR',
          source: 'db',
          message: 'Connection failed',
        },
      ],
      total: 42,
      count: 4,
    });
  });

  it('getHourlyLogPage uses default skip value as 0', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        data: ['2026-03-23 10:00:00 | INFO | system | Started successfully'],
        total: 1,
        count: 1,
      },
    });

    await logsApi.getHourlyLogPage('log-2');

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/logs/hourly/log-2', {
      params: { skip: 0, limit: 10 },
    });
  });

  it('getHourlyLogPage returns empty parsed lines when raw lines are invalid', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        data: ['bad line', 'still bad'],
        total: 2,
        count: 2,
      },
    });

    const result = await logsApi.getHourlyLogPage('log-3');

    expect(result).toEqual({
      lines: [],
      total: 2,
      count: 2,
    });
  });

  it('exports PAGE_SIZE as 10', () => {
    expect(logsApi.PAGE_SIZE).toBe(10);
  });

  it('throws when getHourlyLogs api call fails', async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Hourly logs failed'));

    await expect(logsApi.getHourlyLogs()).rejects.toThrow('Hourly logs failed');
    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/logs/hourly');
  });

  it('throws when getHourlyLogPage api call fails', async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Hourly log detail failed'));

    await expect(logsApi.getHourlyLogPage('log-5', 30)).rejects.toThrow(
      'Hourly log detail failed',
    );

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/logs/hourly/log-5', {
      params: { skip: 30, limit: 10 },
    });
  });
});