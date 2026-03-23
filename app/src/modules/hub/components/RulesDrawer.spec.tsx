import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RulesDrawer from './RulesDrawer';
import type { ReviewRow } from '@/modules/hub/types/hubTypes';

/* ─── Mock data ───────────────────────────────────────────── */

const baseSelectedRow: ReviewRow = {
  id: '1',
  rule_key: 'rule-1',
  project_key: 'proj-1',
  name: 'Customer Eligibility Rule',
  projectName: 'Project Alpha',
  version: '1.0',
  projectStatus: 'Active',
  approvalStatus: 'Approved',
};

/* ─── Tests ───────────────────────────────────────────────── */

describe('RulesDrawer', () => {
  it('renders selected row details correctly', () => {
    render(<RulesDrawer selectedRow={baseSelectedRow} canReview={true} />);

    expect(screen.getByText('Rule')).toBeInTheDocument();
    expect(screen.getByText('Customer Eligibility Rule')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders fallback values when selectedRow is null', () => {
  render(<RulesDrawer selectedRow={null} canReview={true} />);

  expect(screen.getByText('Rule')).toBeInTheDocument();
  expect(screen.getByText('Project')).toBeInTheDocument();
  expect(screen.getByText('Version')).toBeInTheDocument();
  expect(screen.getByText('Project Status')).toBeInTheDocument();
  expect(screen.getByText('Approval')).toBeInTheDocument();
  expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  expect(screen.queryByText('Pending')).not.toBeInTheDocument();
});

  it('shows approved approval status', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          approvalStatus: 'Approved',
        }}
        canReview={true}
      />,
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('shows rejected approval status', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          approvalStatus: 'Rejected',
        }}
        canReview={true}
      />,
    );

    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('shows pending approval status', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          approvalStatus: 'Pending',
        }}
        canReview={true}
      />,
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows active project status', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          projectStatus: 'Active',
        }}
        canReview={true}
      />,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows archived project status', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          projectStatus: 'Archived',
        }}
        canReview={true}
      />,
    );

    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('shows fallback project status for non-active and non-archived status', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          projectStatus: 'Draft',
        }}
        canReview={true}
      />,
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows info alert when version is --', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          version: '--',
        }}
        canReview={true}
      />,
    );

    expect(
      screen.getByText('No version available. Create a version before reviewing this rule.'),
    ).toBeInTheDocument();
  });

  it('does not show no-version alert when version exists', () => {
    render(<RulesDrawer selectedRow={baseSelectedRow} canReview={true} />);

    expect(
      screen.queryByText('No version available. Create a version before reviewing this rule.'),
    ).not.toBeInTheDocument();
  });

  it('shows permission warning when canReview is false', () => {
    render(<RulesDrawer selectedRow={baseSelectedRow} canReview={false} />);

    expect(
      screen.getByText('You do not have permission to approve or reject this rule'),
    ).toBeInTheDocument();
  });

  it('does not show permission warning when canReview is true', () => {
    render(<RulesDrawer selectedRow={baseSelectedRow} canReview={true} />);

    expect(
      screen.queryByText('You do not have permission to approve or reject this rule'),
    ).not.toBeInTheDocument();
  });

  it('shows both alerts when version is -- and canReview is false', () => {
    render(
      <RulesDrawer
        selectedRow={{
          ...baseSelectedRow,
          version: '--',
        }}
        canReview={false}
      />,
    );

    expect(
      screen.getByText('No version available. Create a version before reviewing this rule.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('You do not have permission to approve or reject this rule'),
    ).toBeInTheDocument();
  });
});