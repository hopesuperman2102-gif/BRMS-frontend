import { AlertColor } from "@mui/material";

// AddMenu Component 
export type AddMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onFile: () => void;
  onFolder: () => void;
};

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

export type CreateItemDialogProps = {
  open: boolean;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { [key: string]: string }) => Promise<{ success: boolean; error?: string }>;
  title?: string;
  fields?: Array<{ name: string; label: string; required?: boolean }>;
};

export type Project = {
  id: number;
  name: string;
};

export type ProjectTabsProps = {
  projects: Project[];
  activeProjectId: number | null;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
};

export interface AlertStateProps {
  open: boolean;
  message: string;
  type: AlertColor;
  showAlert: (message: string, type: AlertColor) => void;
  hideAlert: () => void;
}

