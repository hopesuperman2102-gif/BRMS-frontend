'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { motion } from 'framer-motion';
import UndoIcon from '@mui/icons-material/Undo';
import DescriptionIcon from '@mui/icons-material/Description';
import { DeploymentHistory } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';
import { Badge } from 'app/src/core/components/RcBadge';

interface ActiveRulesTableProps {
  rules: DeploymentHistory[];
  selectedRules: Set<string>;
  onToggleRule: (ruleId: string) => void;
  onRollback: (ruleId: string) => void;
  onViewLogs: (ruleId: string) => void;
  environment: string;
  delay?: number;
}

export const ActiveRulesTable: React.FC<ActiveRulesTableProps> = ({
  rules,
  selectedRules,
  onToggleRule,
  onRollback,
  onViewLogs,
  environment = 'Dev',
  delay = 0.7
}) => {
  const MotionTableRow = motion(TableRow);

  return (
    <RcCard delay={delay}>
      <CardHeader title="Environment-Specific Rule Listing & History" />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
          Active Rules in {environment}
        </Typography>
        
        <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Rule
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Deployed Version
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Deployed By
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule, idx) => (
                <MotionTableRow
                  key={rule.id ?? `rule-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedRules.has(rule.id)}
                      onChange={() => onToggleRule(rule.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {rule.ruleName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {rule.deploymentDate || 'Deployment Date/Time'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {rule.deployedBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Badge status={rule.status} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollback(rule.id);
                          }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <UndoIcon fontSize="small" />
                        </IconButton>
                      </motion.div>
                      <Typography variant="caption" color="text.secondary">
                        Rollback
                      </Typography>

                      <motion.div whileHover={{ scale: 1.1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewLogs(rule.id);
                          }}
                          sx={{ color: 'text.secondary', ml: 2 }}
                        >
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                      </motion.div>
                      <Typography variant="caption" color="text.secondary">
                        View Logs
                      </Typography>
                    </Box>
                  </TableCell>
                </MotionTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="h6" fontWeight={600} color="text.primary">
        Deployment History for {environment}
      </Typography>
    </RcCard>
  );
};