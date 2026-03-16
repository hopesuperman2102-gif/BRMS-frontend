import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import type { RuleResponse } from '@/modules/rules/types/ruleEndpointsTypes';
import type { ProjectView } from '@/modules/hub/types/hubEndpointsTypes';

const mockNavigate = vi.fn();
let mockParams: Record<string, string> = { vertical_Key: 'finance', project_key: 'proj-1' };
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  useSearchParams: () => [mockSearchParams],
}));

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: vi.fn(() => ({ roles: [], hasRole: () => false, isRuleAuthor: false, isSuperAdmin: false, isAdmin: false, isReviewer: false, isViewer: false })),
}));

vi.mock('@/modules/rules/api/rulesApi', () => ({
  rulesApi: {
    getRuleDetails: vi.fn(),
    getProjectRules: vi.fn(),
    createRule: vi.fn(),
    updateRuleNameAndDirectory: vi.fn(),
  },
}));

vi.mock('@/modules/hub/api/projectsApi', () => ({
  projectsApi: {
    getProjectsView: vi.fn(),
  },
}));

vi.mock('@/modules/rules/components/CreateRuleLeftPanel', () => ({
  default: ({ isEditMode, onBack }: { isEditMode: boolean; onBack: () => void }) => (
    <div data-testid="left-panel">
      <span data-testid="lp-edit-mode">{String(isEditMode)}</span>
      <button data-testid="lp-back-btn" onClick={onBack}>back</button>
    </div>
  ),
}));

vi.mock('@/modules/rules/components/CreateRuleRightPanel', () => ({
  default: ({
    isEditMode,
    form,
    loading,
    error,
    focused,
    locationLabel,
    onFormChange,
    onFocus,
    onBlur,
    onSubmit,
    onCancel,
    onBack,
  }: {
    isEditMode: boolean;
    form: { name: string; description: string; directory: string };
    loading: boolean;
    error: string | null;
    focused: string | null;
    locationLabel: string;
    onFormChange: (field: string, value: string) => void;
    onFocus: (field: string) => void;
    onBlur: () => void;
    onSubmit: () => void;
    onCancel: () => void;
    onBack: () => void;
  }) => (
    <div data-testid="right-panel">
      <span data-testid="rp-edit-mode">{String(isEditMode)}</span>
      <span data-testid="rp-loading">{String(loading)}</span>
      <span data-testid="rp-error">{error ?? ''}</span>
      <span data-testid="rp-focused">{focused ?? ''}</span>
      <span data-testid="rp-location">{locationLabel}</span>
      <span data-testid="rp-name">{form.name}</span>
      <span data-testid="rp-description">{form.description}</span>
      <span data-testid="rp-directory">{form.directory}</span>
      <button data-testid="rp-change-name" onClick={() => onFormChange('name', 'Updated')}>change name</button>
      <button data-testid="rp-change-desc-long" onClick={() => onFormChange('description', 'a'.repeat(301))}>long desc</button>
      <button data-testid="rp-focus-name" onClick={() => onFocus('name')}>focus name</button>
      <button data-testid="rp-blur" onClick={onBlur}>blur</button>
      <button data-testid="rp-submit" onClick={onSubmit}>submit</button>
      <button data-testid="rp-cancel" onClick={onCancel}>cancel</button>
      <button data-testid="rp-back" onClick={onBack}>back</button>
    </div>
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: { colors: { bgRoot: '#000' } },
}));

vi.mock('@mui/material', () => ({
  Box: ({ children, sx }: { children?: React.ReactNode; sx?: object }) => (
    <div data-testid="box" style={sx as React.CSSProperties}>{children}</div>
  ),
  Typography: ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="typography">{children}</span>
  ),
}));

import { rulesApi } from '@/modules/rules/api/rulesApi';
import { projectsApi } from '@/modules/hub/api/projectsApi';
import { useRole } from '@/modules/auth/hooks/useRole';
import CreateRulePage from './CreateRulePage';

const mockedGetProjectsView         = vi.mocked(projectsApi.getProjectsView);
const mockedGetRuleDetails          = vi.mocked(rulesApi.getRuleDetails);
const mockedGetProjectRules         = vi.mocked(rulesApi.getProjectRules);
const mockedCreateRule              = vi.mocked(rulesApi.createRule);
const mockedUpdateRuleNameAndDirectory = vi.mocked(rulesApi.updateRuleNameAndDirectory);
const mockedUseRole                 = vi.mocked(useRole);

const PROJECTS: ProjectView[] = [
  { id: '1', project_key: 'proj-1', name: 'Finance Project' },
  { id: '2', project_key: 'proj-2', name: 'Health Project' },
];

const RULE_DETAIL: RuleResponse = {
  rule_key: 'rule-abc',
  name: 'My Rule',
  description: 'A description',
  status: 'draft',
  directory: 'finance/rules/My Rule',
};

const renderPage = () => render(<CreateRulePage />);

describe('CreateRulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { vertical_Key: 'finance', project_key: 'proj-1' };
    mockSearchParams = new URLSearchParams();
    mockedUseRole.mockReturnValue({ roles: [], hasRole: () => false, isRuleAuthor: false, isSuperAdmin: false, isAdmin: false, isReviewer: false, isViewer: false });
    mockedGetProjectsView.mockResolvedValue(PROJECTS);
  });

  describe('initial render — create mode', () => {
    it('renders the left and right panels', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('left-panel')).toBeTruthy());
      expect(screen.getByTestId('right-panel')).toBeTruthy();
    });

    it('passes isEditMode=false to both panels when no key param', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('lp-edit-mode').textContent).toBe('false'));
      expect(screen.getByTestId('rp-edit-mode').textContent).toBe('false');
    });

    it('passes loading=false initially', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-loading').textContent).toBe('false'));
    });

    it('passes error=null initially', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-error').textContent).toBe(''));
    });

    it('initialises form.name as empty string', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe(''));
    });

    it('initialises form.description as empty string', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-description').textContent).toBe(''));
    });
  });

  describe('directory param initialisation', () => {
    it('sets form.directory from decoded directory search param', async () => {
      mockSearchParams = new URLSearchParams({ directory: encodeURIComponent('finance/rules') });
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-directory').textContent).toBe('finance/rules')
      );
    });

    it('sets form.directory to empty string when no directory param', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-directory').textContent).toBe(''));
    });
  });

  describe('project name fetch', () => {
    it('calls getProjectsView with vertical_Key on mount', async () => {
      renderPage();
      await waitFor(() => expect(mockedGetProjectsView).toHaveBeenCalledWith('finance'));
    });

    it('sets locationLabel to project name when directory is empty', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-location').textContent).toBe('Finance Project')
      );
    });

    it('does not call getProjectsView when params are missing', async () => {
      mockParams = {};
      renderPage();
      await waitFor(() => expect(mockedGetProjectsView).not.toHaveBeenCalled());
    });
  });

  describe('locationLabel derivation', () => {
    it('shows "Root" when directory is empty and project name not yet loaded', async () => {
      mockedGetProjectsView.mockResolvedValue([]);
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-location').textContent).toBe('Root')
      );
    });

    it('formats directory path with › separators', async () => {
      mockSearchParams = new URLSearchParams({ directory: encodeURIComponent('finance/rules') });
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-location').textContent).toBe('finance › rules')
      );
    });
  });

  describe('edit mode — rule loading', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams({ key: 'rule-abc' });
      mockedGetRuleDetails.mockResolvedValue(RULE_DETAIL);
    });

    it('passes isEditMode=true when key param is present', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-edit-mode').textContent).toBe('true')
      );
    });

    it('shows loading state while rule is being fetched', async () => {
      mockedGetRuleDetails.mockReturnValue(new Promise(() => {}));
      await act(async () => { renderPage(); });
      expect(screen.getByTestId('typography').textContent).toBe('Loading rule…');
    });

    it('calls getRuleDetails with the rule key', async () => {
      renderPage();
      await waitFor(() => expect(mockedGetRuleDetails).toHaveBeenCalledWith('rule-abc'));
    });

    it('populates form.name from the loaded rule', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-name').textContent).toBe('My Rule')
      );
    });

    it('populates form.description from the loaded rule', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-description').textContent).toBe('A description')
      );
    });

    it('strips the last path segment from directory', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-directory').textContent).toBe('finance/rules')
      );
    });

    it('sets error when getRuleDetails returns null', async () => {
      mockedGetRuleDetails.mockResolvedValue(null as unknown as RuleResponse);
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-error').textContent).toBe('Rule not found')
      );
    });

    it('sets error when getRuleDetails throws', async () => {
      mockedGetRuleDetails.mockRejectedValue(new Error('fetch failed'));
      renderPage();
      await waitFor(() =>
        expect(screen.getByTestId('rp-error').textContent).toBe('Failed to load rule')
      );
    });
  });

  describe('form interactions', () => {
    it('updates form.name when onFormChange is called with "name"', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      expect(screen.getByTestId('rp-name').textContent).toBe('Updated');
    });

    it('sets focused field when onFocus is called', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-focus-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-focus-name')); });
      expect(screen.getByTestId('rp-focused').textContent).toBe('name');
    });

    it('clears focused field when onBlur is called', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-focus-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-focus-name')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-blur')); });
      expect(screen.getByTestId('rp-focused').textContent).toBe('');
    });
  });

  describe('navigation handlers', () => {
    it('handleBack navigates to the rules page', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('lp-back-btn'));
      act(() => { fireEvent.click(screen.getByTestId('lp-back-btn')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules'
      );
    });

    it('handleCancel navigates with encoded directory path', async () => {
      mockSearchParams = new URLSearchParams({ directory: encodeURIComponent('finance/rules') });
      renderPage();
      await waitFor(() => screen.getByTestId('rp-cancel'));
      act(() => { fireEvent.click(screen.getByTestId('rp-cancel')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules?path=finance%2Frules'
      );
    });

    it('handleBack from right panel navigates to rules page', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-back'));
      act(() => { fireEvent.click(screen.getByTestId('rp-back')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules'
      );
    });
  });

  describe('handleSubmit — validation', () => {
    it('sets error when user has no permission (isReviewer=true)', async () => {
      mockedUseRole.mockReturnValue({ roles: [], hasRole: () => false, isRuleAuthor: false, isSuperAdmin: false, isAdmin: false, isReviewer: true, isViewer: false });
      renderPage();
      await waitFor(() => screen.getByTestId('rp-submit'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe(
        'You do not have permission to create or edit rules'
      );
    });

    it('sets error when user is a viewer', async () => {
      mockedUseRole.mockReturnValue({ roles: [], hasRole: () => false, isRuleAuthor: false, isSuperAdmin: false, isAdmin: false, isReviewer: false, isViewer: true });
      renderPage();
      await waitFor(() => screen.getByTestId('rp-submit'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe(
        'You do not have permission to create or edit rules'
      );
    });

    it('sets error when rule name is empty', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-submit'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('Rule name is required');
    });

    it('does not call createRule when name is missing (guard runs before API)', async () => {
      mockedCreateRule.mockResolvedValue({} as never);
      renderPage();
      await waitFor(() => screen.getByTestId('rp-submit'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedCreateRule).not.toHaveBeenCalled();
      expect(screen.getByTestId('rp-error').textContent).toBe('Rule name is required');
    });

    it('sets error when description exceeds 300 characters', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-change-desc-long')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('Description cannot exceed 300 characters');
      expect(mockedCreateRule).not.toHaveBeenCalled();
    });

;
  });

  describe('handleSubmit — create rule', () => {
    beforeEach(() => {
      mockedCreateRule.mockResolvedValue({} as never);
    });

    it('calls createRule with correct payload', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedCreateRule).toHaveBeenCalledWith({
        project_key: 'proj-1',
        name: 'Updated',
        description: '',
        directory: 'Updated',
      });
    });

    it('builds fullDirectory as name when directory is empty', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedCreateRule).toHaveBeenCalledWith(
        expect.objectContaining({ directory: 'Updated' })
      );
    });

    it('builds fullDirectory as directory/name when directory is set', async () => {
      mockSearchParams = new URLSearchParams({ directory: encodeURIComponent('finance/rules') });
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedCreateRule).toHaveBeenCalledWith(
        expect.objectContaining({ directory: 'finance/rules/Updated' })
      );
    });

    it('navigates after successful create', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules?path='
      );
    });

    it('sets loading=true while submitting', async () => {
      mockedCreateRule.mockReturnValue(new Promise(() => {}));
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-loading').textContent).toBe('true');
    });

    it('sets loading=false after successful create', async () => {
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-loading').textContent).toBe('false');
    });

    it('sets error message when createRule throws an Error', async () => {
      mockedCreateRule.mockRejectedValue(new Error('API failure'));
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('API failure');
    });

    it('sets generic error when createRule throws a non-Error', async () => {
      mockedCreateRule.mockRejectedValue('string error');
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('Something went wrong');
    });
  });

  describe('handleSubmit — edit rule', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams({ key: 'rule-abc' });
      mockedGetRuleDetails.mockResolvedValue(RULE_DETAIL);
      mockedGetProjectRules.mockResolvedValue({ vertical_name: 'Finance', project_name: 'Finance Project', rules: [] });
      mockedUpdateRuleNameAndDirectory.mockResolvedValue({} as never);
    });

    it('calls getProjectRules to check for duplicates', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe('My Rule'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedGetProjectRules).toHaveBeenCalledWith('proj-1', 'finance');
    });

    it('calls updateRuleNameAndDirectory with correct payload', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe('My Rule'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedUpdateRuleNameAndDirectory).toHaveBeenCalledWith({
        rule_key: 'rule-abc',
        name: 'My Rule',
        directory: 'finance/rules/My Rule',
        description: 'A description',
        updated_by: 'admin',
      });
    });

    it('sets duplicate error when another rule has the same directory', async () => {
      mockedGetProjectRules.mockResolvedValue({
        vertical_name: 'Finance',
        project_name: 'Finance Project',
        rules: [{ rule_key: 'other-rule', name: 'My Rule', description: '', status: 'draft', directory: 'finance/rules/My Rule' }],
      });
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe('My Rule'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe(
        'A rule with that name already exists in this folder'
      );
    });

    it('does not flag duplicate when the matching rule is the current rule', async () => {
      mockedGetProjectRules.mockResolvedValue({
        vertical_name: 'Finance',
        project_name: 'Finance Project',
        rules: [{ rule_key: 'rule-abc', name: 'My Rule', description: '', status: 'draft', directory: 'finance/rules/My Rule' }],
      });
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe('My Rule'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockedUpdateRuleNameAndDirectory).toHaveBeenCalled();
    });

    it('navigates after successful update', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe('My Rule'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules?path=finance%2Frules'
      );
    });

    it('sets error when updateRuleNameAndDirectory throws', async () => {
      mockedUpdateRuleNameAndDirectory.mockRejectedValue(new Error('Update failed'));
      renderPage();
      await waitFor(() => expect(screen.getByTestId('rp-name').textContent).toBe('My Rule'));
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('Update failed');
    });
  });

  describe('missing params guard', () => {
    it('sets error when project_key is missing on submit', async () => {
      mockParams = { vertical_Key: 'finance' };
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('Project key is missing');
    });

    it('sets error when vertical_Key is missing on submit', async () => {
      mockParams = { project_key: 'proj-1' };
      renderPage();
      await waitFor(() => screen.getByTestId('rp-change-name'));
      act(() => { fireEvent.click(screen.getByTestId('rp-change-name')); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-submit')); });
      expect(screen.getByTestId('rp-error').textContent).toBe('Vertical key is missing');
    });
  });
});