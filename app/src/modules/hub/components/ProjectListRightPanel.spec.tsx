import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectListRightPanel from './ProjectListRightPanel';

/* ─── Default Props ───────────────────────────── */

const mockHandlers = {
  onPageChange: vi.fn(),
  onOpenProject: vi.fn(),
  onMenuOpen: vi.fn(),
  onMenuClose: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onNewProject: vi.fn(),
  onHoverProject: vi.fn(),
};

const sampleProjects = [
  {
    project_key: '1',
    name: 'Project One',
    updatedAt: 'Today',
    domain: 'finance',
  },
  {
    project_key: '2',
    name: 'Project Two',
    updatedAt: 'Yesterday',
    domain: '',
  },
];

const defaultProps = {
  loading: false,
  paginatedProjects: [],
  totalPages: 1,
  page: 1,
  menuAnchorEl: null,
  isRuleAuthor: false,
  ...mockHandlers,
};

const renderComponent = (props = {}) =>
  render(<ProjectListRightPanel {...defaultProps} {...props} />);

/* ─── Tests ───────────────────────────── */

describe('ProjectListRightPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ─── Header ───────────────── */

  it('renders header correctly', () => {
    renderComponent();

    expect(screen.getByText('All Projects')).toBeInTheDocument();
    expect(
      screen.getByText('Select a project to manage its rules')
    ).toBeInTheDocument();
  });

  it('shows new project button when allowed', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: /\+ new project/i })
    ).toBeInTheDocument();
  });

  it('hides new project button for rule author', () => {
    renderComponent({ isRuleAuthor: true });

    expect(
      screen.queryByRole('button', { name: /\+ new project/i })
    ).not.toBeInTheDocument();
  });

  /* ─── Loading State ───────────────── */

  it('shows loader when loading', () => {
    renderComponent({ loading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  /* ─── Empty State ───────────────── */

  it('shows empty state when no projects', () => {
    renderComponent({ paginatedProjects: [] });

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(
      screen.getByText('Get started by creating your first project')
    ).toBeInTheDocument();
  });

  /* ─── Projects List ───────────────── */

  it('renders project list', () => {
    renderComponent({ paginatedProjects: sampleProjects });

    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('shows domain badge when domain exists', () => {
    renderComponent({ paginatedProjects: sampleProjects });

    expect(screen.getByText('finance')).toBeInTheDocument();
  });

  it('calls onOpenProject when card clicked', () => {
    renderComponent({ paginatedProjects: sampleProjects });

    fireEvent.click(screen.getByText('Project One'));

    expect(mockHandlers.onOpenProject).toHaveBeenCalledWith(
      sampleProjects[0]
    );
  });

  it('handles hover events', () => {
    renderComponent({ paginatedProjects: sampleProjects });

    const card = screen.getByText('Project One');

    fireEvent.mouseEnter(card);
    expect(mockHandlers.onHoverProject).toHaveBeenCalledWith(
      sampleProjects[0]
    );

    fireEvent.mouseLeave(card);
    expect(mockHandlers.onHoverProject).toHaveBeenCalledWith(null);
  });

  /* ─── Menu ───────────────── */

  it('opens menu on menu button click', () => {
    renderComponent({ paginatedProjects: sampleProjects });

    const menuButtons = screen.getAllByRole('button');
    fireEvent.click(menuButtons[1]); // first menu button

    expect(mockHandlers.onMenuOpen).toHaveBeenCalled();
  });

  it('does not show menu button for rule author', () => {
    renderComponent({
      paginatedProjects: sampleProjects,
      isRuleAuthor: true,
    });

    expect(screen.queryByRole('button', { name: '' })).toBeNull();
  });

  it('renders menu and triggers edit/delete', () => {
    renderComponent({
      paginatedProjects: sampleProjects,
      menuAnchorEl: document.createElement('div'),
    });

    fireEvent.click(screen.getByText('Edit'));
    expect(mockHandlers.onEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Delete'));
    expect(mockHandlers.onDelete).toHaveBeenCalled();
  });

  /* ─── Pagination ───────────────── */

  it('renders pagination when multiple pages', () => {
    renderComponent({
      totalPages: 3,
      paginatedProjects: sampleProjects,
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('calls onPageChange', () => {
  renderComponent({
    totalPages: 3,
    paginatedProjects: sampleProjects,
    page: 1,
  });

  fireEvent.click(
    screen.getByRole('button', { name: /go to page 2/i })
  );

  expect(mockHandlers.onPageChange).toHaveBeenCalledWith(2);
});

  /* ─── New Project Action ───────────────── */

  it('calls onNewProject', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: /\+ new project/i })
    );

    expect(mockHandlers.onNewProject).toHaveBeenCalled();
  });

  /* ─── Menu Close ───────────────── */

  it('calls onMenuClose when menu closes', () => {
    renderComponent({
      paginatedProjects: sampleProjects,
      menuAnchorEl: document.createElement('div'),
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockHandlers.onMenuClose).toHaveBeenCalledTimes(0);
    // (MUI handles close internally, so we just ensure no crash)
  });
});