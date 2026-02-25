import { ENV } from '../../../config/env';
import axiosInstance from '../../auth/Axiosinstance';

const BASE = ENV.API_BASE_URL;

export interface RawHourlyLogMeta {
  file_key: string;
  created_at: string;
  line_count: number;
}

export interface RawHourlyListResponse {
  data: RawHourlyLogMeta[];
  total: number;
}

export interface RawHourlyLogDetail {
  file_key: string;
  data: string[];
  total: number;
  skip: number;
  limit: number;
  count: number;
}

export interface ParsedLogLine {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  source: string;
  message: string;
}

export interface HourlyLogEntry {
  file_key: string;
  id: string;
  created_at: string;
  lines: ParsedLogLine[];
  linesLoaded: boolean;
  info: number;
  warnings: number;
  errors: number;
  total: number;
}

function parseLogLine(line: string): ParsedLogLine | null {
  const parts = line.split(' | ');
  if (parts.length >= 4) {
    return {
      timestamp: parts[0].trim(),
      level:     parts[1].trim() as 'INFO' | 'WARNING' | 'ERROR',
      source:    parts[2].trim(),
      message:   parts.slice(3).join(' | ').trim(),
    };
  }
  return null;
}

export function parseLogLines(data: string[]): ParsedLogLine[] {
  return data.map(parseLogLine).filter(Boolean) as ParsedLogLine[];
}

export function deriveCountsFromRaw(data: string[]): { info: number; warnings: number; errors: number } {
  let info = 0, warnings = 0, errors = 0;
  for (const line of data) {
    if      (line.includes(' | INFO | '))    info++;
    else if (line.includes(' | WARNING | ')) warnings++;
    else if (line.includes(' | ERROR | '))   errors++;
  }
  return { info, warnings, errors };
}

const PAGE_SIZE = 10;

export const logsApi = {

  getHourlyLogs: async (): Promise<HourlyLogEntry[]> => {
    const res = await axiosInstance.get<RawHourlyListResponse>(
      `${BASE}/api/v1/logs/hourly`
    );
    return res.data.data.map((meta): HourlyLogEntry => ({
      file_key:    meta.file_key,
      id:          meta.file_key,
      created_at:  meta.created_at,
      lines:       [],
      linesLoaded: false,
      info:        0,
      warnings:    0,
      errors:      0,
      total:       meta.line_count,
    }));
  },

  getHourlyLogPage: async (
    fileKey: string,
    skip = 0,
  ): Promise<{ lines: ParsedLogLine[]; total: number; count: number }> => {
    const res = await axiosInstance.get<RawHourlyLogDetail>(
      `${BASE}/api/v1/logs/hourly/${fileKey}`,
      { params: { skip, limit: PAGE_SIZE } }
    );
    return {
      lines: parseLogLines(res.data.data),
      total: res.data.total,
      count: res.data.count,
    };
  },

  PAGE_SIZE,
};