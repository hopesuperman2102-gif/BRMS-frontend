import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectListLeftPanel from './ProjectListLeftPanel';

type RcLeftPanelStats = {
  label: string;
  value: string | number;
};

type RcLeftPanelPreview = {
  name: string;
  description: string;
  tag: string;
};

type RcLeftPanelMockProps = {
  title: string;
  subtitle: string;
  stats: RcLeftPanelStats[];
  preview?: RcLeftPanelPreview;
  placeholderText?: string;
};

vi.mock('@/core/components/RcLeftPanel', () => ({
  default: (props: RcLeftPanelMockProps) => (
    <div>
      <p>{props.title}</p>
      <p>{props.subtitle}</p>
      <p>{props.stats[0].label}</p>
      <p>{props.stats[0].value}</p>
      {props.preview ? (
        <>
          <p>{props.preview.name}</p>
          <p>{props.preview.description}</p>
          <p>{props.preview.tag}</p>
        </>
      ) : (
        <p>{props.placeholderText}</p>
      )}
    </div>
  ),
}));

const mockProjects = [
  {
    id: '1',
    project_key: 'p1',
    name: 'Project One',
    description: 'Desc One',
    domain: 'finance',
    updatedAt: 'Today',
  },
  {
    id: '2',
    project_key: 'p2',
    name: 'Project Two',
    description: '',
    domain: '',
    updatedAt: 'Yesterday',
  },
];

describe('ProjectListLeftPanel', () => {
  it('renders title, subtitle and stats', () => {
    render(<ProjectListLeftPanel projects={mockProjects} hoveredProject={null} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage and organize your rule projects across teams and domains.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Total projects')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows placeholder when no hovered project', () => {
    render(<ProjectListLeftPanel projects={mockProjects} hoveredProject={null} />);

    expect(
      screen.getByText('Hover a project to see its details here.'),
    ).toBeInTheDocument();
  });

  it('shows preview when hovered project exists', () => {
    render(
      <ProjectListLeftPanel
        projects={mockProjects}
        hoveredProject={mockProjects[0]}
      />,
    );

    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Desc One')).toBeInTheDocument();
    expect(screen.getByText('finance')).toBeInTheDocument();
  });

  it('handles missing description fallback', () => {
    render(
      <ProjectListLeftPanel
        projects={mockProjects}
        hoveredProject={mockProjects[1]}
      />,
    );

    expect(
      screen.getByText('No description provided for this project.'),
    ).toBeInTheDocument();
  });
});