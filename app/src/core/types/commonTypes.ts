import { AlertColor } from "@mui/material";

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

