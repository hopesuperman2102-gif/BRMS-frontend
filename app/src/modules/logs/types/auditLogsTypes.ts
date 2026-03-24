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

// Hour TimelinePanel Props
export interface HourTimelinePanelProps {
  selectedDay: string | null;
  selectedFile: string | null;
  dayEntries: HourlyLogEntry[];
  chartEntries: HourlyLogEntry[];
  onHourSelect: (fileKey: string) => void;
  formatDateLabel: (dateKey: string) => string;
}

//Logs ToolBars Types
export interface DayOption {
  value: string;
  label: string;
}

export interface LogsToolbarProps {
  dayDropdownItems: DayOption[];
  selectedDay: string | null;
  onDaySelect: (day: string) => void;
  onBack: () => void;
}

//Logs View Panel Types 
export interface LogViewerPanelProps {
  activeEntry?: HourlyLogEntry;
  visibleLines: ParsedLogLine[];
  currentPage: number;
  totalPages: number;
  pageTotal: number;
  pageSize: number;
  linesLoading: boolean;
  selectedFile: string | null;
  onPageChange: (page: number) => void;
  formatCreatedAt: (iso: string) => string;
}