import { AlertColor, SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

export type HeaderIconProps = {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export type LogoTitleProps = {
  logo: React.ReactNode;
  organizationName?: string;
};

export type AppBarComponentProps = {
  logo: React.ReactNode;
  organizationName?: string;
};

export type MoveConfirmDialogProps = {
  open: boolean;
  itemName: string;
  targetName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export interface AlertStateProps {
  open: boolean;
  message: string;
  type: AlertColor;
  showAlert: (message: string, type: AlertColor) => void;
  hideAlert: () => void;
}

export interface CircularProgressProps {
  percentage: number;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
}

// Card Types
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animate?: boolean;
  sx?: SxProps<Theme>;
  onClick?: () => void; 
}
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

// Collapsible Table Types
export type RcColumn<T> = {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => React.ReactNode;
};
export type RcSection<T> = {
  showHeader: boolean;
  key: string;
  title: string;
  rows: T[];
};
export interface RcCollapsibleTableProps<T> {
  columns: RcColumn<T>[];
  sections: RcSection<T>[];
  getRowId: (row: T) => string | number;
}

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Dropdown Types

export interface RcDropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isAddNew?: boolean;
}

export interface RcDropdownProps {
  label: string;
  items: RcDropdownItem[];
  onSelect: (value: string) => void;
  startIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  value?: string | null;
}

//Types for MonthlyBarChart
export interface MonthlyData {
  year: number;
  month: number;
  total: number;
}
export interface Props {
  // Data
  data: MonthlyData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  // Labels
  title: string;
  subtitle: string;
  // Appearance
  height?: number;
  barColors?: string[];
  tooltipSuffix?: string; // Tooltip
  showTooltip?: boolean; // Hover tooltip (opt-out)
}

export type RcTableProps = {
  headers: readonly string[];
  rows: Record<string, ReactNode>[];
  onRowClick?: (row: Record<string, ReactNode>, index: number) => void;
  selectedRowIndex?: number | null;
};


export type SectionHeaderProps = {
  left: ReactNode;
  right?: ReactNode;
};

export interface RcEmailProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  sx?: SxProps<Theme>;
  onFocus?: () => void;
  onBlur?: () => void;
  startIcon?: React.ReactNode;
  autoComplete?: string;
}

export interface RcInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  startIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export interface RcPasswordProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  startIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export interface RcTextAreaProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  sx?: SxProps<Theme>;
}

// RcAppDrawer

export interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: DrawerAction[];    // footer buttons — rendered left to right, each fullWidth
  width?: number;              // default 380
  anchor?: 'right' | 'left';  // default 'right'
}

export interface DrawerAction {
  label: string;
  loadingLabel?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

// Rc Left Panel 

export type LeftPanelStat = {
  label: string;
  value: string | number;
};

export type LeftPanelPreview = {

  dimLabel?: string;
  name: string;
  description?: string;
  tag?: string;
};

export type LeftPanelLogo = {

  icon: React.ReactNode;
  text: string;
};

export type LeftPanelCount = {
  value: number;
  label: string;
};

export type LeftPanelFeature = string;

export interface LeftPanelProps {

  variant?: 'list' | 'create';
  breakpoint?: number;         //Hide panel below this breakpoint (default 900px for list, 1200px for create) 
  width?: string;             // Panel width (default "38%" for list, "42%" for create)
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  stats?: LeftPanelStat[];
  statCards?: LeftPanelStat[];
  preview?: LeftPanelPreview | null;
  placeholderText?: string;
  footer?: string;

  /* ── Create variant ────────────────────────────────── */

  logo?: LeftPanelLogo;
  backLabel?: string;
  onBack?: () => void;
  badge?: string;
  headline?: string;
  heroCopy?: string;
  features?: LeftPanelFeature[];
  count?: LeftPanelCount;
  children?: React.ReactNode;
}