import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ControlSection } from './Controlsection';
import { Environment } from '@/modules/deploy/types/deployTypes';

const ruleVersionControlSpy = vi.fn();
const environmentDeploymentSpy = vi.fn();

vi.mock('@/modules/deploy/components/Ruleversioncontrol', () => ({
  RuleVersionControl: (props: unknown) => {
    ruleVersionControlSpy(props);
    return <div data-testid="rule-version-control" />;
  },
}));

vi.mock('@/modules/deploy/components/Environmentdeployment', () => ({
  EnvironmentDeployment: (props: unknown) => {
    environmentDeploymentSpy(props);
    return <div data-testid="environment-deployment" />;
  },
}));

describe('ControlSection', () => {
  it('renders both child components with expected props', () => {
    const props = {
      rules: [],
      selectedRules: new Set<string>(),
      selectedVersions: new Map<string, string>(),
      onToggleRule: vi.fn(),
      onVersionChange: vi.fn(),
      environments: ['DEV', 'QA', 'PROD'] as Environment[],
      selectedEnvironment: 'DEV' as Environment,
      onEnvironmentChange: vi.fn(),
      onDeploy: vi.fn(),
      canDeploy: true,
      lastDeployedBy: 'John',
      lastDeployedTime: '2m ago',
      isLoading: false,
    };

    render(<ControlSection {...props} />);

    expect(screen.getByTestId('rule-version-control')).toBeInTheDocument();
    expect(screen.getByTestId('environment-deployment')).toBeInTheDocument();
    expect(ruleVersionControlSpy).toHaveBeenCalledWith(expect.objectContaining({
      rules: props.rules,
      selectedRules: props.selectedRules,
      selectedVersions: props.selectedVersions,
      onToggleRule: props.onToggleRule,
      onVersionChange: props.onVersionChange,
      isLoading: false,
      delay: 0.5,
    }));
    expect(environmentDeploymentSpy).toHaveBeenCalledWith(expect.objectContaining({
      environments: props.environments,
      selectedEnvironment: 'DEV',
      onEnvironmentChange: props.onEnvironmentChange,
      onDeploy: props.onDeploy,
      canDeploy: true,
      delay: 0.5,
    }));
  });
});
