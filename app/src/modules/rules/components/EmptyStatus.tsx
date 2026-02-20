import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const { colors } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */
const Root = styled(Box)({
  textAlign: 'center',
  paddingTop: '72px',
  paddingBottom: '72px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const IconBox = styled(Box)({
  width: 68,
  height: 68,
  borderRadius: '20px',
  background: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
  border: `1.5px dashed ${colors.indigoLight}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TextBlock = styled(Box)({});

const EmptyTitle = styled(Typography)({
  fontWeight: 700,
  color: colors.lightTextHigh,
  fontSize: '0.9375rem',
  marginBottom: '4px',
});

/* ─── Component ───────────────────────────────────────────── */
export function EmptyStatus() {
  return (
    <Root>
      <IconBox>
        <FolderOpenIcon sx={{ fontSize: 30, color: colors.indigoLightMuted }} />
      </IconBox>
      <TextBlock>
        <EmptyTitle>This folder is empty</EmptyTitle>
      </TextBlock>
    </Root>
  );
}