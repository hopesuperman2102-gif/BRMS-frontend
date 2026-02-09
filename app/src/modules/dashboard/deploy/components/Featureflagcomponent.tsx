// app/src/modules/feature-flags/components/FeatureFlagComponent.tsx

'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { FeatureFlagHeader } from './FeatureFlagHeader';
import {  Environment } from '../types/featureFlagTypes';
import { StatsSection } from './Statssection';
import { ControlSection } from './Controlsection';
import { HistorySection } from './Historysection';
import { environments, mockActiveRules, mockRules, mockStats } from '../mock_data';

export default function FeatureFlagComponent() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>('QA');
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [selectedHistoryRules, setSelectedHistoryRules] = useState<Set<string>>(new Set());

  const toggleRule = (ruleId: string) => {
    const newSelected = new Set(selectedRules);
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    setSelectedRules(newSelected);
  };

  const toggleHistoryRule = (ruleId: string) => {
    const newSelected = new Set(selectedHistoryRules);
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    setSelectedHistoryRules(newSelected);
  };

  const handleDeploy = () => {
    console.log(`Deploying to ${selectedEnvironment}...`);
    console.log('Selected rules:', Array.from(selectedRules));
    alert(`Deploying to ${selectedEnvironment}`);
  };

  const handleRollback = (ruleId: string) => {
    console.log(`Rolling back rule: ${ruleId}`);
    alert(`Rolling back rule: ${ruleId}`);
  };

  const handleViewLogs = (ruleId: string) => {
    console.log(`Viewing logs for rule: ${ruleId}`);
    alert(`Viewing logs for rule: ${ruleId}`);
  };

  const handleEnvironmentClick = (env: Environment) => {
    console.log(`Environment clicked: ${env}`);
    setSelectedEnvironment(env);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        p: 4
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <FeatureFlagHeader
          totalRules={mockStats.totalRules}

          environments={environments}
          activeEnvironment={selectedEnvironment}
          onEnvironmentClick={handleEnvironmentClick}
        />

        {/* Stats Section */}
        <StatsSection stats={mockStats} />

        {/* Control Section */}
        <ControlSection
          rules={mockRules}
          selectedRules={selectedRules}
          onToggleRule={toggleRule}
          environments={environments}
          selectedEnvironment={selectedEnvironment}
          onEnvironmentChange={setSelectedEnvironment}
          onDeploy={handleDeploy}
          lastDeployedBy="John Doe"
          lastDeployedTime="2m ago"
        />

        {/* History Section */}
        <HistorySection
          rules={mockActiveRules}
          selectedRules={selectedHistoryRules}
          onToggleRule={toggleHistoryRule}
          onRollback={handleRollback}
          onViewLogs={handleViewLogs}
          environment="Dev"
        />
      </Box>
    </Box>
  );
}