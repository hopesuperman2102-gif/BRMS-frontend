// app/src/modules/feature-flags/components/RuleVersionControl.tsx

'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Checkbox,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Rule, GroupedRule } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';

interface RuleVersionControlProps {
  rules: Rule[];
  selectedRules: Set<string>;
  selectedVersions: Map<string, string>;
  onToggleRule: (ruleKey: string) => void;
  onVersionChange: (ruleKey: string, version: string) => void;
  delay?: number;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}

const VersionPicker: React.FC<{
  versions: string[];
  chosen: string | null;
  onChange: (v: string) => void;
}> = ({ versions, chosen, onChange }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const recalc = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    recalc();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  // Dropdown JSX — rendered via portal into document.body so it's
  // completely outside the overflow:auto scroll container
  const dropdown = (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-away */}
          <Box
            onClick={() => setOpen(false)}
            sx={{ position: 'fixed', inset: 0, zIndex: 1300 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: pos.top,
              right: pos.right,
              zIndex: 1301,
              minWidth: 130,
            }}
          >
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1.5px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                overflow: 'hidden',
                py: 0.5,
              }}
            >
              {versions.map((v) => (
                <Box
                  key={v}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(v);
                    setOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 0.75,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: chosen === v ? 'primary.main' : 'text.primary',
                    bgcolor: chosen === v ? 'primary.lighter' : 'transparent',
                    borderLeft: '3px solid',
                    borderColor: chosen === v ? 'primary.main' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                    },
                  }}
                >
                  <span>{v}</span>
                  {chosen === v && (
                    <CheckCircleIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                  )}
                </Box>
              ))}
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger pill */}
      <Box
        ref={triggerRef}
        onClick={handleOpen}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.5,
          borderRadius: '20px',
          border: '1.5px solid',
          borderColor: chosen ? 'primary.main' : 'divider',
          bgcolor: chosen ? 'primary.main' : 'transparent',
          color: chosen ? 'white' : 'text.secondary',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          letterSpacing: '0.04em',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: chosen ? 'primary.dark' : 'primary.lighter',
            color: chosen ? 'white' : 'primary.main',
          },
        }}
      >
        {chosen ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 13 }} />
            {chosen}
          </>
        ) : (
          <>
            <CodeIcon sx={{ fontSize: 13 }} />
            Pick version
          </>
        )}
        <Box
          component="span"
          sx={{
            ml: 0.25,
            fontSize: '0.6rem',
            opacity: 0.7,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}
        >
          ▾
        </Box>
      </Box>

      {/* Portal — renders dropdown directly in document.body, outside all overflow containers */}
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </>
  );
};

export const RuleVersionControl: React.FC<RuleVersionControlProps> = ({
  rules,
  selectedRules,
  selectedVersions,
  onToggleRule,
  onVersionChange,
  delay = 0.5,
  isLoading = false,
  sx,
}) => {
  const groupedRules = useMemo<GroupedRule[]>(() => {
    const map = new Map<string, GroupedRule>();
    rules.forEach((rule) => {
      if (map.has(rule.rule_key)) {
        map.get(rule.rule_key)!.versions.push(rule.version);
      } else {
        map.set(rule.rule_key, {
          rule_key: rule.rule_key,
          rule_name: rule.rule_name,
          versions: [rule.version],
        });
      }
    });
    return Array.from(map.values());
  }, [rules]);

  return (
    <RcCard delay={delay} sx={sx}>
      <CardHeader title="Rule & Version Control" />

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        ) : groupedRules.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 5,
              gap: 1,
            }}
          >
            <CodeIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.disabled" fontWeight={500}>
              No undeployed approved rules
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 128,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': { width: 3 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 4 },
            }}
          >
            {groupedRules.map((rule, idx) => {
              const isChecked = selectedRules.has(rule.rule_key);
              const chosenVersion = selectedVersions.get(rule.rule_key) ?? null;

              return (
                <motion.div
                  key={rule.rule_key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + idx * 0.08 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1,
                      py: 1.25,
                      borderRadius: 2,
                      position: 'relative',
                      transition: 'background 0.18s ease',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        height: '60%',
                        width: 3,
                        borderRadius: '0 3px 3px 0',
                        bgcolor: isChecked ? 'primary.main' : 'transparent',
                        transition: 'background 0.2s ease',
                        boxShadow: isChecked
                          ? '0 0 6px 1px rgba(101,82,208,0.5)'
                          : 'none',
                      },
                    }}
                    onClick={() => onToggleRule(rule.rule_key)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={() => onToggleRule(rule.rule_key)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        p: 0.5,
                        color: 'text.disabled',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: isChecked ? 'primary.main' : 'text.primary',
                          transition: 'color 0.18s ease',
                          fontSize: '0.82rem',
                        }}
                        title={rule.rule_name}
                      >
                        {rule.rule_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          fontSize: '0.68rem',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {rule.versions.length} version
                        {rule.versions.length !== 1 ? 's' : ''} available
                      </Typography>
                    </Box>

                    <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0 }}>
                      <VersionPicker
                        versions={rule.versions}
                        chosen={chosenVersion}
                        onChange={(version) => {
                          console.log('Version selected:', version, 'for rule:', rule.rule_key);
                          onVersionChange(rule.rule_key, version);
                        }}
                      />
                    </Box>
                  </Box>

                  {idx < groupedRules.length - 1 && (
                    <Divider sx={{ mx: 1, opacity: 0.5 }} />
                  )}
                </motion.div>
              );
            })}
          </Box>
        )}
      </Box>

      <Divider sx={{ mt: 2 }} />
    </RcCard>
  );
};