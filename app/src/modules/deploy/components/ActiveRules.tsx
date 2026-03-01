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
import { motion } from 'framer-motion';
import UndoIcon from '@mui/icons-material/Undo';
import DescriptionIcon from '@mui/icons-material/Description';
import RedoIcon from '@mui/icons-material/Redo';
import { ActiveRulesProps, DeployedRule } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';
import { deployApi } from '../api/deployApi';
import RcConfirmDailog from 'app/src/core/components/RcConfirmDailog';

const MotionTableRow = motion(TableRow);

const ROW_HEIGHT = 53;
const MAX_VISIBLE_ROWS = 3;

export const ActiveRules: React.FC<ActiveRulesProps> = ({
  rules,
  onRevoked,
  onViewLogs,
  environment,
  delay = 0.7,
}) => {
  const [revokeLoadingKey, setRevokeLoadingKey] = useState<string | null>(null);

  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DeployedRule | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<string>('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [ruleToRevoke, setRuleToRevoke] = useState<DeployedRule | null>(null);

  /* ── Revoke ─────────────────────────────────────────────── */
  const handleRevoke = (rule: DeployedRule) => {
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

  /* ── Promote dialog ─────────────────────────────────────── */
  const handleOpenPromote = (rule: DeployedRule) => {
  setSelectedRule(rule);
  setPromoteTarget(rule.deployable_env[0] ?? '');
  setPromoteDialogOpen(true);
};

  // update handlePromoteSubmit
const handlePromoteSubmit = async () => {
  if (!selectedRule || !promoteTarget) return;
  setIsPromoting(true);
  try {
    await deployApi.promoteRule(selectedRule.rule_key, promoteTarget, selectedRule.environment);
    setPromoteDialogOpen(false);
    onRevoked();
  } catch (err) {
    console.error('Promote failed:', err);
  } finally {
    setIsPromoting(false);
  }
};

  return (
    <RcCard delay={delay}>
      <CardHeader title="Environment-Specific Rule Listing & History" />

      <Box sx={{ mb: 3 }}>
        {/* Section header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Active Rules in {environment}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <motion.div whileHover={{ scale: 1.1 }}>
              <IconButton
                size="small"
                onClick={() => onViewLogs('')}
                sx={{ color: 'text.secondary' }}
              >
                <DescriptionIcon fontSize="small" />
              </IconButton>
            </motion.div>
            <Typography variant="caption" color="text.secondary">
              View Logs
            </Typography>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: ROW_HEIGHT * MAX_VISIBLE_ROWS + 57,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
          }}
        >
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>

            <TableHead sx={{ bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 1 }}>
              <TableRow>
                {['Rule Name', 'Version', 'Environment', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No deployed rules found
                    </Typography>
                  </TableCell>
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
                      sx={{ '&:hover': { bgcolor: 'primary.lighter', cursor: 'pointer' } }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={rule.rule_name}
                        >
                          {rule.rule_name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={rule.version}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: 'primary.lighter', color: 'primary.main', fontSize: '0.75rem' }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip label={rule.environment} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* Revoke */}
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <IconButton
                              size="small"
                              disabled={isRevoking}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevoke(rule);
                              }}
                              sx={{ color: isRevoking ? 'text.disabled' : 'error.main' }}
                            >
                              {isRevoking
                                ? <CircularProgress size={14} />
                                : <UndoIcon fontSize="small" />}
                            </IconButton>
                          </motion.div>
                          <Typography variant="caption" color="text.secondary">
                            Revoke
                          </Typography>

                          {/* Promote */}
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPromote(rule);
                              }}
                              sx={{ color: 'success.main', ml: 1 }}
                            >
                              <RedoIcon fontSize="small" />
                            </IconButton>
                          </motion.div>
                          <Typography variant="caption" color="text.secondary">
                            Promote
                          </Typography>
                        </Box>
                      </TableCell>
                    </MotionTableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Promote Dialog */}
<Dialog
  open={promoteDialogOpen}
  onClose={() => setPromoteDialogOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: '12px',
      minWidth: 400,
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    }
  }}
>
  <DialogTitle sx={{ fontWeight: 800, pb: 0.5, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
    Promote Rule
  </DialogTitle>

  <DialogContent sx={{ pt: '12px !important' }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Select the target environment to promote{' '}
      <strong>{selectedRule?.rule_name}</strong> ({selectedRule?.version}).
    </Typography>

    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}
    >
      Target Environment
    </Typography>

    {/* Separated pill buttons — no MUI border-collapse weirdness */}
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {(selectedRule?.deployable_env ?? []).map((env) => {
        const isSelected = promoteTarget === env;
        return (
          <Box
            key={env}
            onClick={() => setPromoteTarget(env)}
            sx={{
              flex: 1,
              py: 1.25,
              borderRadius: '8px',
              border: '1.5px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              bgcolor: isSelected ? 'primary.main' : 'transparent',
              color: isSelected ? 'white' : 'text.secondary',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.04em',
              textAlign: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.15s ease',
              boxShadow: isSelected ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
              '&:hover': {
                borderColor: 'primary.main',
                color: isSelected ? 'white' : 'primary.main',
                bgcolor: isSelected ? 'primary.dark' : 'primary.lighter',
              },
            }}
          >
            {env}
          </Box>
        );
      })}
    </Box>
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
    <Button
      variant="outlined"
      onClick={() => setPromoteDialogOpen(false)}
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        px: 3,
        borderColor: 'divider',
        color: 'text.secondary',
        '&:hover': { borderColor: 'text.secondary' },
      }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      onClick={handlePromoteSubmit}
      disabled={!promoteTarget || isPromoting}
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 700,
        px: 3,
        boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
        '&:hover': { boxShadow: '0 6px 20px rgba(79,70,229,0.4)' },
      }}
    >
      {isPromoting ? 'Promoting...' : `Promote to ${promoteTarget}`}
    </Button>
  </DialogActions>
</Dialog>
<RcConfirmDailog
  open={!!ruleToRevoke}
  title="Revoke Deployment"
  message={`Are you sure you want to revoke "${ruleToRevoke?.rule_name}" (${ruleToRevoke?.version}) from ${ruleToRevoke?.environment}?`}
  confirmText="Revoke"
  isDangerous
  onConfirm={handleConfirmRevoke}
  onCancel={() => setRuleToRevoke(null)}
/>
    </RcCard>
  );
};