import { VerticalProject } from "@/modules/hub/types/hubTypes";

//rules Endpoints Types
export interface VerticalRulesResponse {
  vertical_key: string;
  vertical_name: string;
  projects: VerticalProject[];
}

export interface ReviewResponse {
  rule_key: string;
  version: string;
  status: string;
}

// logs Endpoints Types
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

// projects Endpoints Types
export interface ProjectView {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VerticalProjectsResponse {
  vertical_key: string;
  vertical_name: string;
  status: string;
  projects: ProjectView[];
}

export interface CacheEntry {
  data: VerticalProjectsResponse;
  expiresAt: number;
}