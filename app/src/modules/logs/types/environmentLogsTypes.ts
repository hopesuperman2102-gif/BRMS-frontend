import { RawEnvLogFileMeta } from "@/modules/deploy/types/deployEndpointsTypes";
import { LogLevelCounts } from "../utils/envLogsUtils";


// Enviromment Logs 
export interface LevelConfig {
  color: string;
  bg: string;
  label: string;
}

export interface EnvironmentLogsBodyProps {
  loading: boolean;
  linesLoading: boolean;
  error: string | null;
  lines: ParsedEnvLogLine[];
  environment: string;
  getLevelConfig: (level: string) => LevelConfig;
}

// Environment logs Footer 
export interface EnvironmentLogsFooterProps {
  pageTotal: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  linesLoading: boolean;
  selectedFile: string | null;
  levelStats: LogLevelCounts;
  onPageChange: (page: number) => void;
}

// Environment Logs header 
interface DateOption {
  value: string;
  label: string;
}

export interface EnvironmentLogsHeaderProps {
  environment: string;
  envColor: string;
  selectedDate: string;
  dateOptions: DateOption[];
  loading: boolean;
  linesLoading: boolean;
  files: RawEnvLogFileMeta[];
  selectedFile: string | null;
  selectedFileIndex: number;
  selectedCreatedAt?: string;
  currentPage: number;
  totalPages: number;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  onClose: () => void;
  onFileChange: (fileKey: string) => void;
}

//Env Logs Props
export interface ParsedEnvLogLine {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}

export interface EnvironmentLogsProps {
  open: boolean;
  environment: string;
  onClose: () => void;
}