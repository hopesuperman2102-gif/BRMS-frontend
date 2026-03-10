import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcLeftPanel from './RcLeftPanel';

describe('RcLeftPanel', () => {
  describe('List variant', () => {
    it('renders title, subtitle and stats', () => {
      render(
        <RcLeftPanel
          variant="list"
          icon={<span data-testid="panel-icon">I</span>}
          title="Rules"
          subtitle="Manage your rules"
          stats={[{ label: 'Total', value: '24' }]}
          statCards={[{ label: 'Active', value: '18' }]}
          preview={{
            name: 'Rule A',
            description: 'Rule description',
            tag: 'Draft',
          }}
        />
      );

      expect(screen.getByText('Rules')).toBeInTheDocument();
      expect(screen.getByText('Manage your rules')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Rule A')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('renders placeholder when preview is not provided', () => {
      render(
        <RcLeftPanel
          variant="list"
          title="Rules"
          placeholderText="Choose a rule to preview"
        />
      );

      expect(screen.getByText('Choose a rule to preview')).toBeInTheDocument();
    });
  });

  describe('Create variant', () => {
    it('renders logo and hero content', () => {
      render(
        <RcLeftPanel
          variant="create"
          logo={{ icon: <span data-testid="logo-icon">L</span>, text: 'BRMS' }}
          badge="Create"
          headline="Build faster"
          heroCopy="Create new rules with guided steps."
          features={['Guided forms', 'Role aware flow']}
          count={{ value: 3, label: 'template' }}
        />
      );

      expect(screen.getByTestId('logo-icon')).toBeInTheDocument();
      expect(screen.getByText('BRMS')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Build faster')).toBeInTheDocument();
      expect(screen.getByText('Guided forms')).toBeInTheDocument();
      expect(screen.getByText('3 templates available')).toBeInTheDocument();
    });

    it('renders back button and calls onBack', () => {
      const onBack = vi.fn();

      render(
        <RcLeftPanel
          variant="create"
          onBack={onBack}
          backLabel="Go Back"
          headline="Build faster"
        />
      );

      fireEvent.click(screen.getByText('Go Back'));

      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });
});
