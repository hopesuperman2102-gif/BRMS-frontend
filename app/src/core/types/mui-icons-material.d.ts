// types/mui-icons-material.d.ts
// Type declarations for @mui/icons-material

declare module '@mui/icons-material' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  
  export const PlayArrow: ComponentType<SvgIconProps>;
  export const Lightbulb: ComponentType<SvgIconProps>;
  export const Check: ComponentType<SvgIconProps>;
  export const FolderOpen: ComponentType<SvgIconProps>;
  export const Save: ComponentType<SvgIconProps>;
  export const SaveAs: ComponentType<SvgIconProps>;
  export const InsertDriveFile: ComponentType<SvgIconProps>;
}

declare module '@mui/icons-material/PlayArrow' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const PlayArrow: ComponentType<SvgIconProps>;
  export default PlayArrow;
}

declare module '@mui/icons-material/Lightbulb' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const Lightbulb: ComponentType<SvgIconProps>;
  export default Lightbulb;
}

declare module '@mui/icons-material/Check' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const Check: ComponentType<SvgIconProps>;
  export default Check;
}

declare module '@mui/icons-material/FolderOpen' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const FolderOpen: ComponentType<SvgIconProps>;
  export default FolderOpen;
}

declare module '@mui/icons-material/Save' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const Save: ComponentType<SvgIconProps>;
  export default Save;
}

declare module '@mui/icons-material/SaveAs' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const SaveAs: ComponentType<SvgIconProps>;
  export default SaveAs;
}

declare module '@mui/icons-material/InsertDriveFile' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const InsertDriveFile: ComponentType<SvgIconProps>;
  export default InsertDriveFile;
}

declare module '@mui/icons-material/*' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  import { ComponentType } from 'react';
  const Icon: ComponentType<SvgIconProps>;
  export default Icon;
}