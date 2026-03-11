'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Box, Checkbox, Typography, CircularProgress, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GroupedRule, RuleVersionControlProps } from '@/modules/deploy/types/deployTypes';
import { RcCard, CardHeader } from '@/core/components/RcCard';
import { brmsTheme } from '@/core/theme/brmsTheme';

const ControlCard = styled(RcCard)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const ClickAway = styled(Box)({
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
});

const DropdownPanel = styled(Box)({
  backgroundColor: brmsTheme.colors.white,
  border: '1.5px solid',
  borderColor: brmsTheme.colors.lightBorder,
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
  overflow: 'hidden',
  paddingTop: 4,
  paddingBottom: 4,
});

const DropdownOption = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 12px',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  color: selected ? brmsTheme.colors.primary : brmsTheme.colors.textPrimary,
  backgroundColor: selected ? brmsTheme.colors.lightPurpleSurface : 'transparent',
  borderLeft: '3px solid',
  borderColor: selected ? brmsTheme.colors.primary : 'transparent',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: brmsTheme.colors.lightPurpleSurfaceHover,
    color: brmsTheme.colors.primary,
  },
}));

const SelectedCheckIcon = styled(CheckCircleIcon)({
  fontSize: 13,
  color: brmsTheme.colors.primary,
});

const PickerTrigger = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'open',
})<{ selected: boolean; open: boolean }>(({ selected, open }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 12px',
  borderRadius: 20,
  border: '1.5px solid',
  borderColor: selected ? brmsTheme.colors.primary : brmsTheme.colors.borderGrayHover,
  backgroundColor: selected ? brmsTheme.colors.primary : 'transparent',
  color: selected ? brmsTheme.colors.white : brmsTheme.colors.textSecondary,
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.2s ease',
  letterSpacing: '0.04em',
  '&:hover': {
    borderColor: brmsTheme.colors.primary,
    backgroundColor: selected ? brmsTheme.colors.primaryHover : brmsTheme.colors.lightPurpleSurface,
    color: selected ? brmsTheme.colors.white : brmsTheme.colors.primary,
  },
  '& .picker-arrow': {
    marginLeft: 2,
    fontSize: '0.6rem',
    opacity: 0.7,
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s ease',
    display: 'inline-block',
  },
}));

const SmallCheckIcon = styled(CheckCircleIcon)({
  fontSize: 13,
});

const SmallCodeIcon = styled(CodeIcon)({
  fontSize: 13,
});

const ContentStack = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

const CenteredLoader = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 40,
  paddingBottom: 40,
});

const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 40,
  paddingBottom: 40,
  gap: 8,
});

const EmptyStateIcon = styled(CodeIcon)({
  fontSize: 32,
  color: brmsTheme.colors.lightTextLow,
});

const RuleList = styled(Box)({
  maxHeight: 128,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  '&::-webkit-scrollbar': { width: 3 },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { backgroundColor: brmsTheme.colors.lightBorderHover, borderRadius: 4 },
});

const RuleRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'checked',
})<{ checked: boolean }>(({ checked }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 8px',
  borderRadius: 8,
  position: 'relative',
  transition: 'background 0.18s ease',
  cursor: 'pointer',
  '&:hover': { backgroundColor: brmsTheme.colors.bgGrayLightShade },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '20%',
    height: '60%',
    width: 3,
    borderRadius: '0 3px 3px 0',
    backgroundColor: checked ? brmsTheme.colors.primary : 'transparent',
    transition: 'background 0.2s ease',
    boxShadow: 'none',
  },
}));

const RuleCheckbox = styled(Checkbox)({
  flexShrink: 0,
  padding: 4,
  color: brmsTheme.colors.neutralGray,
  '&.Mui-checked': { color: brmsTheme.colors.primary },
});

const RuleInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const RuleName = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'checked',
})<{ checked: boolean }>(({ checked }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: checked ? brmsTheme.colors.primary : brmsTheme.colors.textPrimary,
  transition: 'color 0.18s ease',
  fontSize: '0.82rem',
}));

const RuleMeta = styled(Typography)({
  color: brmsTheme.colors.textSecondary,
  fontSize: '0.68rem',
  letterSpacing: '0.03em',
});

const PickerContainer = styled(Box)({
  flexShrink: 0,
});

const RowDivider = styled(Divider)({
  marginLeft: 8,
  marginRight: 8,
  opacity: 0.5,
});

const FooterDivider = styled(Divider)({
  marginTop: 16,
});

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
    setOpen((current) => !current);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  const dropdown = (
    <AnimatePresence>
      {open && (
        <>
          <ClickAway onClick={() => setOpen(false)} />
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
            <DropdownPanel>
              {versions.map((version) => (
                <DropdownOption
                  key={version}
                  selected={chosen === version}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(version);
                    setOpen(false);
                  }}
                >
                  <span>{version}</span>
                  {chosen === version && <SelectedCheckIcon />}
                </DropdownOption>
              ))}
            </DropdownPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <PickerTrigger ref={triggerRef} onClick={handleOpen} selected={Boolean(chosen)} open={open}>
        {chosen ? (
          <>
            <SmallCheckIcon />
            {chosen}
          </>
        ) : (
          <>
            <SmallCodeIcon />
            Pick version
          </>
        )}
        <Box component='span' className='picker-arrow'>▾</Box>
      </PickerTrigger>

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
    <ControlCard delay={delay}>
      <CardHeader title='Rule & Version Control' />

      <ContentStack>
        {isLoading ? (
          <CenteredLoader>
            <CircularProgress size={28} />
          </CenteredLoader>
        ) : groupedRules.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon />
            <Typography variant='body2' color='text.disabled' fontWeight={500}>
              No undeployed approved rules
            </Typography>
          </EmptyState>
        ) : (
          <RuleList>
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
                  <RuleRow checked={isChecked} onClick={() => onToggleRule(rule.rule_key)}>
                    <RuleCheckbox
                      checked={isChecked}
                      onChange={() => onToggleRule(rule.rule_key)}
                      onClick={(event) => event.stopPropagation()}
                      size='small'
                    />

                    <RuleInfo>
                      <RuleName variant='body2' fontWeight={600} checked={isChecked} title={rule.rule_name}>
                        {rule.rule_name}
                      </RuleName>
                      <RuleMeta variant='caption'>
                        {rule.versions.length} version
                        {rule.versions.length !== 1 ? 's' : ''} available
                      </RuleMeta>
                    </RuleInfo>

                    <PickerContainer onClick={(event) => event.stopPropagation()}>
                      <VersionPicker
                        versions={rule.versions}
                        chosen={chosenVersion}
                        onChange={(version) => onVersionChange(rule.rule_key, version)}
                      />
                    </PickerContainer>
                  </RuleRow>

                  {idx < groupedRules.length - 1 && <RowDivider />}
                </motion.div>
              );
            })}
          </RuleList>
        )}
      </ContentStack>

      <FooterDivider />
    </ControlCard>
  );
};
