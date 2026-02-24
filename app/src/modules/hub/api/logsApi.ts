import { ENV } from '../../../config/env';
import axiosInstance from '../../auth/Axiosinstance';

const BASE = ENV.API_BASE_URL;

export interface RawHourlyLog {
  file_key: string;
  id: string;
  created_at: string;
  content: string;
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
  info: number;
  warnings: number;
  errors: number;
  total: number;
}

function parseLogContent(content: string): ParsedLogLine[] {
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      // Format: "2026-02-23 21:05:50 | INFO | app.api.v1... | Message"
      const parts = line.split(' | ');
      if (parts.length >= 4) {
        return {
          timestamp: parts[0].trim(),
          level: (parts[1].trim() as 'INFO' | 'WARNING' | 'ERROR'),
          source: parts[2].trim(),
          message: parts.slice(3).join(' | ').trim(),
        };
      }
      return null;
    })
    .filter(Boolean) as ParsedLogLine[];
}

export const logsApi = {
  getHourlyLogs: async (): Promise<HourlyLogEntry[]> => {
    const res = await axiosInstance.get<RawHourlyLog[]>(`${BASE}/api/v1/logs/hourly`);
    return res.data.map(raw => {
      const lines = parseLogContent(raw.content);
      return {
        file_key: raw.file_key,
        id: raw.id,
        created_at: raw.created_at,
        lines,
        info:     lines.filter(l => l.level === 'INFO').length,
        warnings: lines.filter(l => l.level === 'WARNING').length,
        errors:   lines.filter(l => l.level === 'ERROR').length,
        total:    lines.length,
      };
    });
  },
};