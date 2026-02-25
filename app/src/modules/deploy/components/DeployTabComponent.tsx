'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DeployHeader } from './DeployHeader';
import { Environment, Rule, DeployedRule } from '../types/featureFlagTypes';
import { deployApi, MonthlyData } from '../api/deployApi';
import { useParams } from 'react-router-dom';
import { RcDropdownItem } from 'app/src/core/types/commonTypes';
import RcAlertComponent, { useAlertStore } from 'app/src/core/components/RcAlertComponent';
import { EnvironmentHistory } from './EnvironmentHistory';
import { StatsSection } from './StatsSection';
import { ControlSection } from './ControlSection';

export default function DeployTabComponent() {
  const { vertical_Key } = useParams();
  const { showAlert } = useAlertStore();

  const [activeEnvironment, setActiveEnvironment] = useState<Environment | 'ALL'>('ALL');
  const [deployTargetEnvironment, setDeployTargetEnvironment] = useState<Environment>('DEV');

  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [totalRules, setTotalRules] = useState(0);
  const [projectItems, setProjectItems] = useState<RcDropdownItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>('');
  const [projectMapping, setProjectMapping] = useState<Map<string, string>>(new Map());
  const [undeployedRules, setUndeployedRules] = useState<Rule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [deployedRules, setDeployedRules] = useState<DeployedRule[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<Map<string, string>>(new Map());

  const environments: Environment[] = ['DEV', 'QA', 'PROD'];

  // Chart year state lives here in the page
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [statsData, setStatsData] = useState({
    totalRuleVersions: 0,
    pendingVersions: 0,
    approvedVersions: 0,
    rejectedVersions: 0,
    deployedVersions: 0,
    approvedNotDeployedVersions: 0,
    monthlyDeployments: [] as MonthlyData[],
  });

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const data = await deployApi.getDashboardSummary(vertical_Key!);
        setTotalRules(data.total_active_rules);

        const mapping = new Map<string, string>();
        data.active_projects.forEach((project) => {
          mapping.set(project.project_name, project.project_key);
        });
        setProjectMapping(mapping);

        const formattedProjects = data.active_projects.map((project) => ({
          label: project.project_name,
          value: project.project_name,
        }));
        setProjectItems(formattedProjects);

        if (formattedProjects.length > 0 && data.active_projects.length > 0) {
          setSelectedProject(formattedProjects[0].value);
          setSelectedProjectKey(data.active_projects[0].project_key);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
      }
    };
    fetchDashboardSummary();
  }, [vertical_Key]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!selectedProjectKey) return;
      setIsLoadingRules(true);
      try {
        // Send 'ALL' to backend when ALL is selected, otherwise send the specific env
        const data = await deployApi.getDashboardStats(selectedProjectKey, activeEnvironment);
        setStatsData({
          totalRuleVersions: data.total_rule_versions,
          pendingVersions: data.pending_versions,
          approvedVersions: data.approved_versions,
          rejectedVersions: data.rejected_versions,
          deployedVersions: data.deployed_versions,
          approvedNotDeployedVersions: data.approved_not_deployed_versions,
          monthlyDeployments: data.monthly_deployments || [],
        });
        setUndeployedRules(data.undeployed_approved_versions || []);
        setDeployedRules(data.deployed_rules || []);
        setSelectedVersions(new Map());
        setSelectedRules(new Set());
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setUndeployedRules([]);
        setDeployedRules([]);
      } finally {
        setIsLoadingRules(false);
      }
    };
    fetchDashboardStats();
  }, [selectedProjectKey, activeEnvironment]);

  const handleProjectSelect = (value: string) => {
    setSelectedProject(value);
    const projectKey = projectMapping.get(value);
    if (projectKey) setSelectedProjectKey(projectKey);
  };

  const toggleRule = (ruleId: string) => {
    const newSelected = new Set(selectedRules);
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    setSelectedRules(newSelected);
  };

  const handleVersionChange = (ruleKey: string, version: string) => {
    setSelectedVersions((prev) => {
      const next = new Map(prev);
      next.set(ruleKey, version);
      return next;
    });
  };

  const handleDeploy = async () => {
    if (selectedRules.size === 0) {
      showAlert('Please select at least one rule to deploy.', 'warning');
      return;
    }
    const missingVersion = Array.from(selectedRules).find(
      (ruleKey) => !selectedVersions.get(ruleKey)
    );
    if (missingVersion) {
      showAlert('Please select a version for all checked rules before deploying.', 'warning');
      return;
    }

    const deployPromises = Array.from(selectedRules).map((ruleKey) => {
      const version = selectedVersions.get(ruleKey)!;
      return deployApi.deployRule({
        rule_key: ruleKey,
        version,
        environment: deployTargetEnvironment,
        activated_by: 'admin',
      });
    });

    try {
      await Promise.all(deployPromises);
      showAlert(`Successfully deployed ${selectedRules.size} rule(s) to ${deployTargetEnvironment}`, 'success');

      if (selectedProjectKey) {
        setIsLoadingRules(true);
        try {
          const data = await deployApi.getDashboardStats(selectedProjectKey, activeEnvironment);
          setStatsData({
            totalRuleVersions: data.total_rule_versions,
            pendingVersions: data.pending_versions,
            approvedVersions: data.approved_versions,
            rejectedVersions: data.rejected_versions,
            deployedVersions: data.deployed_versions,
            approvedNotDeployedVersions: data.approved_not_deployed_versions,
            monthlyDeployments: data.monthly_deployments || [],
          });
          setUndeployedRules(data.undeployed_approved_versions || []);
          setDeployedRules(data.deployed_rules || []);
          setSelectedVersions(new Map());
          setSelectedRules(new Set());
        } catch (refreshError) {
          console.error('Failed to refresh after deploy:', refreshError);
        } finally {
          setIsLoadingRules(false);
        }
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      showAlert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleRollback = (ruleKey: string) => showAlert(`Rolling back rule: ${ruleKey}`, 'info');
  const handleViewLogs = (ruleKey: string) => showAlert(`Viewing logs for rule: ${ruleKey}`, 'info');
  const handleEnvironmentClick = (env: Environment | 'ALL') => setActiveEnvironment(env);

  return (
    <Box sx={{ minHeight: '100vh', p: 4 }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <DeployHeader
          totalRules={totalRules}
          projectItems={projectItems}
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
          environments={environments}
          activeEnvironment={activeEnvironment}
          onEnvironmentClick={handleEnvironmentClick}
        />

        <StatsSection
          stats={statsData}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        <ControlSection
          rules={undeployedRules}
          selectedRules={selectedRules}
          selectedVersions={selectedVersions}
          onToggleRule={toggleRule}
          onVersionChange={handleVersionChange}
          environments={environments}
          selectedEnvironment={deployTargetEnvironment}
          onEnvironmentChange={setDeployTargetEnvironment}
          onDeploy={handleDeploy}
          lastDeployedBy="John Doe"
          lastDeployedTime="2m ago"
          isLoading={isLoadingRules}
        />

        <EnvironmentHistory
          rules={deployedRules}
          onRollback={handleRollback}
          onViewLogs={handleViewLogs}
          environment={activeEnvironment === 'ALL' ? 'DEV' : activeEnvironment}
        />
        <RcAlertComponent />
      </Box>
    </Box>
  );
}