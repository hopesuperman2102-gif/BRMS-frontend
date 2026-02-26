'use client';

import React from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import UndoIcon from '@mui/icons-material/Undo';
import DescriptionIcon from '@mui/icons-material/Description';
import { ActiveRulesProps } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';
import RedoIcon from '@mui/icons-material/Redo';

// Defined OUTSIDE the component so the reference never changes between renders.
const MotionTableRow = motion(TableRow);

// Each row is ~53px tall; show 3 rows before scrolling
const ROW_HEIGHT = 53;
const MAX_VISIBLE_ROWS = 3;

export const ActiveRules: React.FC<ActiveRulesProps> = ({
  rules,
  onRollback,
  onViewLogs,
  environment = 'Dev',
  delay = 0.7,
}) => {
  return (
    <RcCard delay={delay}>
      <CardHeader title="Environment-Specific Rule Listing & History" />

      <Box sx={{ mb: 3 }}>
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

        <TableContainer
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            // Scroll after MAX_VISIBLE_ROWS rows; header ~57px + rows
            maxHeight: ROW_HEIGHT * MAX_VISIBLE_ROWS + 57,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
          }}
        >
          <Table
            // table-layout fixed + explicit widths eliminate the extra right space
            sx={{ tableLayout: 'fixed', width: '100%' }}
          >
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>

            <TableHead sx={{ bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 1 }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Rule Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Version
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Environment
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Actions
                </TableCell>
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
                rules.map((rule, idx) => (
                  <MotionTableRow
                    key={`${rule.rule_key}-${rule.version}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    sx={{
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                        cursor: 'pointer',
                      },
                    }}
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
                        sx={{
                          fontWeight: 600,
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={rule.environment}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRollback(rule.rule_key);
                            }}
                            sx={{ color: 'text.secondary' }}
                          >
                            <UndoIcon fontSize="small" />
                          </IconButton>
                        </motion.div>
                        <Typography variant="caption" color="text.secondary">
                          Revoke
                        </Typography>

                        <motion.div whileHover={{ scale: 1.1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewLogs(rule.rule_key);
                            }}
                            sx={{ color: 'text.secondary', ml: 1 }}
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </RcCard>
  );
};