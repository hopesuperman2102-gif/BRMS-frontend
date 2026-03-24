'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import UndoIcon from '@mui/icons-material/Undo';
import DescriptionIcon from '@mui/icons-material/Description';
import RedoIcon from '@mui/icons-material/Redo';
import { ActiveRulesProps, DeployedRule } from '@/modules/deploy/types/deployTypes';
import { RcCard, CardHeader } from '@/core/components/RcCard';
import { deployApi } from '@/modules/deploy/api/deployApi';
import RcConfirmDailog from '@/core/components/RcConfirmDailog';
import { useAlertStore } from '@/core/components/RcAlertComponent';
import { brmsTheme } from '@/core/theme/brmsTheme';

const MotionTableRow = motion(TableRow);

const ROW_HEIGHT = 53;
const MAX_VISIBLE_ROWS = 3;

const Section = styled(Box)({
  marginBottom: 24,
});

const SectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
});

const LogsButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'disabledstate',
})<{ disabledstate: boolean }>(({ disabledstate }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  cursor: disabledstate ? 'not-allowed' : 'pointer',
  borderRadius: 6,
  padding: '2px 6px',
  opacity: disabledstate ? 0.5 : 1,
  transition: 'background 0.15s',
  '&:hover': {
    backgroundColor: disabledstate ? 'transparent' : 'rgba(0,0,0,0.04)',
    '& .MuiTypography-root': { color: disabledstate ? brmsTheme.colors.textSecondary : 'text.primary' },
  },
}));

const LogsIconButton = styled(IconButton)({
  color: brmsTheme.colors.textSecondary,
  pointerEvents: 'none',
});

const LogsText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'disabledstate',
})<{ disabledstate: boolean }>(({ disabledstate }) => ({
  color: disabledstate ? brmsTheme.colors.lightTextLow : brmsTheme.colors.textSecondary,
}));

const StyledTableContainer = styled(TableContainer)({
  borderRadius: 8,
  border: '1px solid',
  borderColor: brmsTheme.colors.lightBorder,
  maxHeight: ROW_HEIGHT * MAX_VISIBLE_ROWS + 57,
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { backgroundColor: brmsTheme.colors.lightBorderHover, borderRadius: 2 },
});

const StyledTable = styled(Table)({
  tableLayout: 'fixed',
  width: '100%',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: brmsTheme.colors.bgGrayLightShade,
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

const HeaderCell = styled(TableCell)({
  fontWeight: 700,
  textTransform: 'uppercase',
  fontSize: '0.75rem',
});

const EmptyCell = styled(TableCell)({
  paddingTop: 32,
  paddingBottom: 32,
});

const RuleName = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const VersionChip = styled(Chip)({
  fontWeight: 600,
  backgroundColor: brmsTheme.colors.lightPurpleSurface,
  color: brmsTheme.colors.primary,
  fontSize: '0.75rem',
});

const EnvironmentChip = styled(Chip)({
  fontWeight: 600,
  fontSize: '0.75rem',
});

const ActionsBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const ActionBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: 'error' | 'success' }>(({ tone }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
  borderRadius: 6,
  padding: '2px 6px',
  transition: 'background 0.15s',
  '&:hover': {
    backgroundColor: tone === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
    '& .MuiTypography-root': { color: tone === 'error' ? 'error.main' : 'success.main' },
  },
}));

const RevokeButtonIcon = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'loading',
})<{ loading: boolean }>(({ loading }) => ({
  color: loading ? brmsTheme.colors.lightTextLow : brmsTheme.colors.errorRed,
  pointerEvents: 'none',
}));

const PromoteButtonIcon = styled(IconButton)({
  color: brmsTheme.colors.success,
  pointerEvents: 'none',
});

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    minWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  fontWeight: 800,
  paddingBottom: 4,
  fontSize: '1.1rem',
  letterSpacing: '-0.02em',
});

const StyledDialogContent = styled(DialogContent)({
  paddingTop: '12px !important',
});

const DialogDescription = styled(Typography)({
  marginBottom: 24,
});

const DialogLabel = styled(Typography)({
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 12,
});

const PromoteTargets = styled(Box)({
  display: 'flex',
  gap: 12,
});

const PromoteTarget = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ selected }) => ({
  flex: 1,
  paddingTop: 10,
  paddingBottom: 10,
  borderRadius: 8,
  border: '1.5px solid',
  borderColor: selected ? brmsTheme.colors.primary : brmsTheme.colors.lightBorder,
  backgroundColor: selected ? brmsTheme.colors.primary : 'transparent',
  color: selected ? brmsTheme.colors.white : brmsTheme.colors.textSecondary,
  fontWeight: 700,
  fontSize: '0.875rem',
  letterSpacing: '0.04em',
  textAlign: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.15s ease',
  boxShadow: selected ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
  '&:hover': {
    borderColor: brmsTheme.colors.primary,
    color: selected ? brmsTheme.colors.white : brmsTheme.colors.primary,
    backgroundColor: selected ? brmsTheme.colors.primaryHover : brmsTheme.colors.lightPurpleSurface,
  },
}));

const StyledDialogActions = styled(DialogActions)({
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 24,
  paddingTop: 8,
  gap: 8,
});

const CancelButton = styled(Button)({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  paddingLeft: 24,
  paddingRight: 24,
  borderColor: brmsTheme.colors.lightBorder,
  color: brmsTheme.colors.textSecondary,
  '&:hover': { borderColor: brmsTheme.colors.textSecondary },
});

const ConfirmButton = styled(Button)({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 700,
  paddingLeft: 24,
  paddingRight: 24,
  boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
  '&:hover': { boxShadow: '0 6px 20px rgba(79,70,229,0.4)' },
});

export const ActiveRules: React.FC<ActiveRulesProps> = ({
  rules,
  onRevoked,
  onPromoted,
  onViewLogs,
  environment,
  canManageActions = true,
  delay = 0.7,
}) => {
  const canViewLogs = environment !== 'ALL';
  const { showAlert } = useAlertStore();
  const [revokeLoadingKey, setRevokeLoadingKey] = useState<string | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DeployedRule | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<string>('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [ruleToRevoke, setRuleToRevoke] = useState<DeployedRule | null>(null);

  const handleRevoke = (rule: DeployedRule) => {
    if (!canManageActions) {
      showAlert('You do not have permission to revoke rules.', 'info');
      return;
    }
    setRuleToRevoke(rule);
  };

  const handleConfirmRevoke = async () => {
    if (!ruleToRevoke) return;
    const rowKey = `${ruleToRevoke.rule_key}-${ruleToRevoke.version}-${ruleToRevoke.environment}`;
    setRevokeLoadingKey(rowKey);
    setRuleToRevoke(null);
    try {
      await deployApi.revokeRule(ruleToRevoke.rule_key, ruleToRevoke.version, ruleToRevoke.environment);
      onRevoked();
    } catch (err) {
      console.error('Revoke failed:', err);
    } finally {
      setRevokeLoadingKey(null);
    }
  };

  const handleOpenPromote = (rule: DeployedRule) => {
    if (!canManageActions) {
      showAlert('You do not have permission to promote rules.', 'info');
      return;
    }
    setSelectedRule(rule);
    setPromoteTarget(rule.deployable_env[0] ?? '');
    setPromoteDialogOpen(true);
  };

  const handlePromoteSubmit = async () => {
    if (!selectedRule || !promoteTarget) return;
    setIsPromoting(true);
    try {
      await deployApi.promoteRule(selectedRule.rule_key, promoteTarget, selectedRule.environment);
      setPromoteDialogOpen(false);
      onPromoted(promoteTarget);
    } catch (err) {
      console.error('Promote failed:', err);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleViewLogsClick = () => {
    if (!canViewLogs) return;
    onViewLogs('');
  };

  return (
    <RcCard delay={delay}>
      <CardHeader title='Environment-Specific Rule Listing & History' />

      <Section>
        <SectionHeader>
          <Typography variant='h6' fontWeight={600} color='text.primary'>
            Active Rules in {environment}
          </Typography>
          <LogsButton
            disabledstate={!canViewLogs}
            onClick={handleViewLogsClick}
            aria-disabled={!canViewLogs}
          >
            <LogsIconButton size='small'>
              <DescriptionIcon fontSize='small' />
            </LogsIconButton>
            <LogsText variant='caption' disabledstate={!canViewLogs}>
              View Logs
            </LogsText>
          </LogsButton>
        </SectionHeader>

        <StyledTableContainer>
          <StyledTable>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>

            <StyledTableHead>
              <TableRow>
                {['Rule Name', 'Version', 'Environment', 'Actions'].map((header) => (
                  <HeaderCell key={header}>{header}</HeaderCell>
                ))}
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <EmptyCell colSpan={4} align='center'>
                    <Typography variant='body2' color='text.secondary'>
                      No deployed rules found
                    </Typography>
                  </EmptyCell>
                </TableRow>
              ) : (
                rules.map((rule, idx) => {
                  const rowKey = `${rule.rule_key}-${rule.version}-${rule.environment}`;
                  const isRevoking = revokeLoadingKey === rowKey;

                  return (
                    <MotionTableRow
                      key={rowKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <RuleName variant='body2' fontWeight={500} title={rule.rule_name}>
                          {rule.rule_name}
                        </RuleName>
                      </TableCell>

                      <TableCell>
                        <VersionChip label={rule.version} size='small' />
                      </TableCell>

                      <TableCell>
                        <EnvironmentChip label={rule.environment} size='small' />
                      </TableCell>

                      <TableCell>
                        <ActionsBox>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <ActionBox tone='error' onClick={(event) => { event.stopPropagation(); handleRevoke(rule); }}>
                              <RevokeButtonIcon size='small' disabled={isRevoking || !canManageActions} loading={isRevoking}>
                                {isRevoking ? <CircularProgress size={14} /> : <UndoIcon fontSize='small' />}
                              </RevokeButtonIcon>
                              <Typography variant='caption' color='text.secondary'>Revoke</Typography>
                            </ActionBox>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.05 }}>
                            <ActionBox tone='success' onClick={(event) => { event.stopPropagation(); handleOpenPromote(rule); }}>
                              <PromoteButtonIcon size='small' disabled={!canManageActions}>
                                <RedoIcon fontSize='small' />
                              </PromoteButtonIcon>
                              <Typography variant='caption' color='text.secondary'>Promote</Typography>
                            </ActionBox>
                          </motion.div>
                        </ActionsBox>
                      </TableCell>
                    </MotionTableRow>
                  );
                })
              )}
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      </Section>

      <StyledDialog open={promoteDialogOpen} onClose={() => setPromoteDialogOpen(false)}>
        <StyledDialogTitle>Promote Rule</StyledDialogTitle>

        <StyledDialogContent>
          <DialogDescription variant='body2' color='text.secondary'>
            Select the target environment to promote <strong>{selectedRule?.rule_name}</strong> ({selectedRule?.version}).
          </DialogDescription>

          <DialogLabel variant='caption' fontWeight={700} color='text.secondary'>
            Target Environment
          </DialogLabel>

          <PromoteTargets>
            {(selectedRule?.deployable_env ?? []).map((env) => (
              <PromoteTarget key={env} selected={promoteTarget === env} onClick={() => setPromoteTarget(env)}>
                {env}
              </PromoteTarget>
            ))}
          </PromoteTargets>
        </StyledDialogContent>

        <StyledDialogActions>
          <CancelButton variant='outlined' onClick={() => setPromoteDialogOpen(false)}>
            Cancel
          </CancelButton>
          <ConfirmButton
            variant='contained'
            onClick={handlePromoteSubmit}
            disabled={!promoteTarget || isPromoting || !canManageActions}
          >
            {isPromoting ? 'Promoting...' : `Promote to ${promoteTarget}`}
          </ConfirmButton>
        </StyledDialogActions>
      </StyledDialog>

      <RcConfirmDailog
        open={!!ruleToRevoke}
        title='Revoke Deployment'
        message={`Are you sure you want to revoke "${ruleToRevoke?.rule_name}" (${ruleToRevoke?.version}) from ${ruleToRevoke?.environment}?`}
        confirmText='Revoke'
        isDangerous
        onConfirm={handleConfirmRevoke}
        onCancel={() => setRuleToRevoke(null)}
      />
    </RcCard>
  );
};
