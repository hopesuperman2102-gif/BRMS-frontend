import { AlertColor, SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

export type HeaderIconProps = {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
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

//Dropdown types
export type RcDropdownItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isAddNew?: boolean; 
};
export type RcDropdownProps = {
  label: string;
  items: RcDropdownItem[];
  onSelect: (value: string) => void;
  startIcon?: React.ReactNode;
  disabled?: boolean;
};

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