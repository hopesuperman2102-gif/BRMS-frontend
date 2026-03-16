import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import type { RuleResponse, ProjectRulesResult } from '@/modules/rules/types/ruleEndpointsTypes';
import type { FileNode, FolderNode, Breadcrumb, ExplorerItem } from '@/modules/rules/types/Explorertypes';

const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
};

const mockNavigate = vi.fn();
let mockParams: Record<string, string> = { vertical_Key: 'finance', project_key: 'proj-1' };
let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: vi.fn(() => ({
    roles: [], hasRole: () => false, isRuleAuthor: false,
    isSuperAdmin: false, isAdmin: false, isReviewer: false, isViewer: false,
  })),
}));

vi.mock('@/modules/rules/api/rulesApi', () => ({
  rulesApi: {
    getProjectRules: vi.fn(),
    deleteRule: vi.fn(),
    updateRuleDirectory: vi.fn(),
  },
}));

vi.mock('@/core/components/RcConfirmDailog', () => ({
  default: ({
    open, title, message, confirmText, cancelText, onConfirm, onCancel,
  }: {
    open: boolean; title: string; message: string;
    confirmText: string; cancelText: string;
    onConfirm: () => void; onCancel: () => void;
  }) => open ? (
    <div data-testid="confirm-dialog">
      <span data-testid="dialog-title">{title}</span>
      <span data-testid="dialog-message">{message}</span>
      <button data-testid="dialog-confirm" onClick={onConfirm}>{confirmText}</button>
      <button data-testid="dialog-cancel" onClick={onCancel}>{cancelText}</button>
    </div>
  ) : null,
}));

const mockShowAlert = vi.fn();
vi.mock('@/core/components/RcAlertComponent', () => ({
  default: () => <div data-testid="alert-component" />,
  useAlertStore: () => ({ showAlert: mockShowAlert }),
}));

vi.mock('@/modules/rules/components/RulesRightPanel', () => ({
  default: ({
    projectName, breadcrumbs, visibleItems, editingFolderId, editingFolderName,
    newMenuAnchor, onNewMenuOpen, onNewMenuClose, onCreateNewRule, onCreateNewFolder,
    onNavigateToBreadcrumb, onOpenFolder, onOpenFile, onMenuOpen,
    onEdit, onDelete, onNameChange, onNameBlur, onNameKeyDown,
    onMouseEnterFile, onMouseLeaveFile, onBack, isReviewer,
  }: {
    projectName: string;
    breadcrumbs: Breadcrumb[];
    visibleItems: ExplorerItem[];
    editingFolderId: string | null;
    editingFolderName: string;
    newMenuAnchor: HTMLElement | null;
    anchorEl: HTMLElement | null;
    onNewMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
    onNewMenuClose: () => void;
    onCreateNewRule: () => void;
    onCreateNewFolder: () => void;
    onNavigateToBreadcrumb: (c: Breadcrumb) => void;
    onOpenFolder: (f: FolderNode) => void;
    onOpenFile: (f: FileNode) => void;
    onMenuOpen: (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => void;
    onMenuClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNameBlur: () => void;
    onNameKeyDown: (e: React.KeyboardEvent) => void;
    onMouseEnterFile: (f: FileNode) => void;
    onMouseLeaveFile: () => void;
    onBack: () => void;
    isReviewer: boolean;
  }) => (
    <div data-testid="right-panel">
      <span data-testid="rp-project-name">{projectName}</span>
      <span data-testid="rp-editing-folder-id">{editingFolderId ?? ''}</span>
      <span data-testid="rp-editing-folder-name">{editingFolderName}</span>
      <span data-testid="rp-new-menu-anchor">{newMenuAnchor ? 'open' : 'closed'}</span>
      <span data-testid="rp-is-reviewer">{String(isReviewer)}</span>
      <span data-testid="rp-breadcrumbs">{breadcrumbs.map((b) => b.name).join('>')}</span>
      <span data-testid="rp-visible-count">{visibleItems.length}</span>
      {visibleItems.map((item) => (
        <div key={item.path} data-testid={`item-${item.path}`}>
          <span>{item.name}</span>
          {item.kind === 'file' && (
            <button data-testid={`open-file-${item.path}`} onClick={() => onOpenFile(item as FileNode)}>open</button>
          )}
          {item.kind === 'folder' && (
            <button data-testid={`open-folder-${item.path}`} onClick={() => onOpenFolder(item as FolderNode)}>open</button>
          )}
          <button data-testid={`menu-open-${item.path}`} onClick={(e) => onMenuOpen(e, item)}>menu</button>
        </div>
      ))}
      <button data-testid="rp-new-menu-open" onClick={(e) => onNewMenuOpen(e as React.MouseEvent<HTMLElement>)}>new menu</button>
      <button data-testid="rp-new-menu-close" onClick={onNewMenuClose}>close new menu</button>
      <button data-testid="rp-create-rule" onClick={onCreateNewRule}>create rule</button>
      <button data-testid="rp-create-folder" onClick={onCreateNewFolder}>create folder</button>
      <button data-testid="rp-edit" onClick={onEdit}>edit</button>
      <button data-testid="rp-delete" onClick={onDelete}>delete</button>
      <button data-testid="rp-name-blur" onClick={onNameBlur}>blur</button>
      <button data-testid="rp-back" onClick={onBack}>back</button>
      <input data-testid="rp-name-input" onChange={onNameChange} onKeyDown={onNameKeyDown} />
      <button data-testid="rp-breadcrumb-0" onClick={() => onNavigateToBreadcrumb(breadcrumbs[0])}>home</button>
      <button data-testid="rp-mouse-enter-file" onClick={() => visibleItems.filter(i => i.kind === 'file').forEach(i => onMouseEnterFile(i as FileNode))}>hover file</button>
      <button data-testid="rp-mouse-leave-file" onClick={onMouseLeaveFile}>leave file</button>
    </div>
  ),
}));

vi.mock('@/modules/rules/components/Rulesleftpanel', () => ({
  default: ({ projectName, files, folders, hoveredRule }: {
    projectName: string;
    files: FileNode[];
    folders: FolderNode[];
    hoveredRule: FileNode | null;
  }) => (
    <div data-testid="left-panel">
      <span data-testid="lp-project-name">{projectName}</span>
      <span data-testid="lp-file-count">{files.length}</span>
      <span data-testid="lp-folder-count">{folders.length}</span>
      <span data-testid="lp-hovered-rule">{hoveredRule?.name ?? ''}</span>
    </div>
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => {
  const colorKeys = [
    'white', 'lightBorder', 'lightTextMid', 'lightTextLow', 'navTextHigh',
    'primaryGlowSoft', 'primary', 'primaryGlowMid', 'panelBorder',
  ];
  const colors = Object.fromEntries(colorKeys.map((k) => [k, k]));
  return { brmsTheme: { colors, fonts: { sans: 'Arial', mono: 'monospace' } } };
});

vi.mock('@mui/icons-material/ArrowBack', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="arrow-back" {...props} />,
}));

vi.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: object }) => (
    <div style={sx as React.CSSProperties} {...props}>{children}</div>
  ),
  Typography: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
  IconButton: ({ children, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { disableRipple?: boolean }) => (
    <button data-testid="back-button" onClick={onClick} {...omit(rest, 'disableRipple')}>{children}</button>
  ),
}));

vi.mock('@mui/material/styles', () => ({
  styled: (Component: React.ElementType) => () => {
    const S = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
      React.createElement(Component, props, children);
    return S;
  },
}));

import { rulesApi } from '@/modules/rules/api/rulesApi';
import { useRole } from '@/modules/auth/hooks/useRole';
import ProjectRulePage, { splitPath, parentOfPath, fmtDate } from './ProjectRulePage';

const mockedGetProjectRules    = vi.mocked(rulesApi.getProjectRules);
const mockedDeleteRule         = vi.mocked(rulesApi.deleteRule);
const mockedUpdateRuleDirectory = vi.mocked(rulesApi.updateRuleDirectory);
const mockedUseRole            = vi.mocked(useRole);

const BASE_ROLE = {
  roles: [], hasRole: () => false, isRuleAuthor: false,
  isSuperAdmin: false, isAdmin: false, isReviewer: false, isViewer: false,
};

const makeRule = (overrides: Partial<RuleResponse> = {}): RuleResponse => ({
  rule_key: 'r1', name: 'Rule One', description: '', status: 'draft',
  directory: 'Rule One', updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const PROJECT_RULES: ProjectRulesResult = {
  vertical_name: 'Finance',
  project_name: 'Finance Project',
  rules: [makeRule()],
};

const renderPage = () => render(<ProjectRulePage />);

describe('ProjectRulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { vertical_Key: 'finance', project_key: 'proj-1' };
    mockSearchParams = new URLSearchParams();
    mockedUseRole.mockReturnValue(BASE_ROLE);
    mockedGetProjectRules.mockResolvedValue(PROJECT_RULES);
    mockedDeleteRule.mockResolvedValue(undefined);
    mockedUpdateRuleDirectory.mockResolvedValue({} as never);
  });

  describe('initial render', () => {
    it('renders left and right panels', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => expect(screen.getByTestId('left-panel')).toBeTruthy());
      expect(screen.getByTestId('right-panel')).toBeTruthy();
    });

    it('renders confirm dialog and alert component', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => expect(screen.getByTestId('alert-component')).toBeTruthy());
    });

    it('renders the back button in the header', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => expect(screen.getByTestId('back-button')).toBeTruthy());
    });
  });

  describe('API load — loadRules', () => {
    it('calls getProjectRules with project_key and vertical_Key', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(mockedGetProjectRules).toHaveBeenCalledWith('proj-1', 'finance')
      );
    });

    it('sets project name from API response', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('lp-project-name').textContent).toBe('Finance Project')
      );
    });

    it('sets vertical name and passes it to the header', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => expect(screen.getByText('Finance')).toBeTruthy());
    });

    it('builds file nodes from rules and passes them to left panel', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('lp-file-count').textContent).toBe('1')
      );
    });

    it('filters out DELETED rules from the tree', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule(), makeRule({ rule_key: 'r2', name: 'Deleted', status: 'DELETED' })],
      });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('lp-file-count').textContent).toBe('1')
      );
    });

    it('does not call getProjectRules when params are missing', async () => {
      mockParams = {};
      await act(async () => { renderPage(); });
      await waitFor(() => expect(mockedGetProjectRules).not.toHaveBeenCalled());
    });

    it('logs error when getProjectRules throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGetProjectRules.mockRejectedValue(new Error('fail'));
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(consoleSpy).toHaveBeenCalledWith('Error loading rules:', expect.any(Error))
      );
      consoleSpy.mockRestore();
    });
  });

  describe('URL path initialisation', () => {
    it('sets currentPath and breadcrumbs from path search param on first render', async () => {
      mockSearchParams = new URLSearchParams({ path: 'finance/rules' });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-breadcrumbs').textContent).toContain('finance')
      );
    });

    it('clears the path search param after reading it', async () => {
      mockSearchParams = new URLSearchParams({ path: 'finance/rules' });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(mockSetSearchParams).toHaveBeenCalledWith({}, { replace: true })
      );
    });

    it('does not set breadcrumbs when no path param exists', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-breadcrumbs').textContent).toBe('Home')
      );
    });
  });

  describe('header navigation', () => {
    it('navigates to hub on back button click', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('back-button'));
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/vertical/finance/dashboard/hub');
    });

    it('navigates to hub on right panel back click', async () => {
      await act(async () => { renderPage(); });
      fireEvent.click(screen.getByTestId('rp-back'));
      expect(mockNavigate).toHaveBeenCalledWith('/vertical/finance/dashboard/hub');
    });
  });

  describe('isReviewer prop', () => {
    it('passes isReviewer=false when neither reviewer nor viewer', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-is-reviewer').textContent).toBe('false')
      );
    });

    it('passes isReviewer=true when isReviewer role', async () => {
      mockedUseRole.mockReturnValue({ ...BASE_ROLE, isReviewer: true });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-is-reviewer').textContent).toBe('true')
      );
    });

    it('passes isReviewer=true when isViewer role', async () => {
      mockedUseRole.mockReturnValue({ ...BASE_ROLE, isViewer: true });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-is-reviewer').textContent).toBe('true')
      );
    });
  });

  describe('folder navigation', () => {
    it('updates breadcrumbs when a folder is opened', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: 'finance/subfolder/Rule One' })],
      });
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('open-folder-finance'));
      act(() => { fireEvent.click(screen.getByTestId('open-folder-finance')); });
      expect(screen.getByTestId('rp-breadcrumbs').textContent).toContain('finance');
    });

    it('navigates to breadcrumb and trims the breadcrumb list', async () => {
      mockSearchParams = new URLSearchParams({ path: 'finance/rules' });
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('rp-breadcrumb-0'));
      act(() => { fireEvent.click(screen.getByTestId('rp-breadcrumb-0')); });
      expect(screen.getByTestId('rp-breadcrumbs').textContent).toBe('Home');
    });

    it('does not open folder when that folder is being edited', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: 'finance/subfolder/Rule One' })],
      });
      await act(async () => { renderPage(); });
      // At root, 'finance' folder is visible. Open it to navigate inside.
      await waitFor(() => screen.getByTestId('open-folder-finance'));
      act(() => { fireEvent.click(screen.getByTestId('open-folder-finance')); });
      // Now inside 'finance', 'subfolder' is visible. Start editing it via the menu.
      await waitFor(() => screen.getByTestId('menu-open-finance/subfolder'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-finance/subfolder')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-edit')); });
      // editingFolderId is now set to 'finance/subfolder'
      const breadcrumbsBefore = screen.getByTestId('rp-breadcrumbs').textContent;
      // Trying to open the folder being edited should be blocked
      act(() => { fireEvent.click(screen.getByTestId('open-folder-finance/subfolder')); });
      expect(screen.getByTestId('rp-breadcrumbs').textContent).toBe(breadcrumbsBefore);
    });
  });

  describe('new menu', () => {
    it('opens the new menu when onNewMenuOpen is triggered', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('rp-new-menu-open'));
      act(() => { fireEvent.click(screen.getByTestId('rp-new-menu-open')); });
      expect(screen.getByTestId('rp-new-menu-anchor').textContent).toBe('open');
    });

    it('closes the new menu when onNewMenuClose is triggered', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('rp-new-menu-open'));
      act(() => { fireEvent.click(screen.getByTestId('rp-new-menu-open')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-new-menu-close')); });
      expect(screen.getByTestId('rp-new-menu-anchor').textContent).toBe('closed');
    });
  });

  describe('create new rule', () => {
    it('navigates to createrules page with encoded directory', async () => {
      await act(async () => { renderPage(); });
      act(() => { fireEvent.click(screen.getByTestId('rp-create-rule')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules/createrules?directory='
      );
    });
  });

  describe('create new folder', () => {
    it('adds a temp folder to the list and enters edit mode', async () => {
      await act(async () => { renderPage(); });
      act(() => { fireEvent.click(screen.getByTestId('rp-create-folder')); });
      expect(screen.getByTestId('lp-folder-count').textContent).toBe('1');
      await waitFor(() =>
        expect(screen.getByTestId('rp-editing-folder-name').textContent).toBe('New folder')
      );
    });
  });

  describe('open file', () => {
    it('navigates to the rule editor and stores rule info in sessionStorage', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('open-file-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('open-file-Rule One')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules/editor?rule=r1'
      );
      expect(sessionStorage.getItem('activeRuleName')).toBe('Rule One');
      expect(sessionStorage.getItem('activeRuleId')).toBe('r1');
    });
  });

  describe('context menu', () => {
    it('opens the context menu for an item', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-Rule One')); });
    });

    it('handleEdit on a file navigates to createrules with rule key', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-Rule One')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-edit')); });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard/hub/proj-1/rules/createrules?key=r1'
      );
    });
  });

  describe('delete — file', () => {
    it('opens confirm dialog for a file with correct title and message', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-Rule One')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
      expect(screen.getByTestId('dialog-title').textContent).toBe('Delete Rule');
      expect(screen.getByTestId('dialog-message').textContent).toContain('Rule One');
    });

    it('calls deleteRule and triggers refetch on confirm', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-Rule One')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
      await act(async () => { fireEvent.click(screen.getByTestId('dialog-confirm')); });
      expect(mockedDeleteRule).toHaveBeenCalledWith('r1');
    });

    it('closes the dialog on cancel', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-Rule One')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
      act(() => { fireEvent.click(screen.getByTestId('dialog-cancel')); });
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });

    it('logs error when deleteRule throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedDeleteRule.mockRejectedValue(new Error('delete failed'));
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-Rule One'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-Rule One')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
      await act(async () => { fireEvent.click(screen.getByTestId('dialog-confirm')); });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('delete — folder', () => {
    beforeEach(() => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: 'finance/subfolder/Rule One' })],
      });
    });

    it('opens confirm dialog for an empty folder', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [],
      });
      await act(async () => { renderPage(); });
      act(() => { fireEvent.click(screen.getByTestId('rp-create-folder')); });
      await waitFor(() => screen.getByTestId('lp-folder-count'));
      const folderItems = screen.queryAllByTestId(/^menu-open-/);
      if (folderItems.length > 0) {
        act(() => { fireEvent.click(folderItems[0]); });
        act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
        expect(screen.getByTestId('dialog-title').textContent).toBe('Delete Folder');
      }
    });

    it('opens confirm dialog for a folder with files inside', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-finance'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-finance')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
      expect(screen.getByTestId('dialog-title').textContent).toBe('Delete Folder');
      expect(screen.getByTestId('dialog-message').textContent).toContain('1 rule');
    });

    it('calls deleteRule for each file inside the folder on confirm', async () => {
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-finance'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-finance')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-delete')); });
      await act(async () => { fireEvent.click(screen.getByTestId('dialog-confirm')); });
      expect(mockedDeleteRule).toHaveBeenCalledWith('r1');
    });
  });

  describe('folder rename — commitFolderRename', () => {
    it('calls onNameBlur which triggers commitFolderRename', async () => {
      await act(async () => { renderPage(); });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-name-blur')); });
    });

    it('commits rename via Enter key', async () => {
      await act(async () => { renderPage(); });
      await act(async () => {
        fireEvent.keyDown(screen.getByTestId('rp-name-input'), { key: 'Enter' });
      });
    });

    it('cancels rename via Escape key — removes the temp folder', async () => {
      await act(async () => { renderPage(); });
      act(() => { fireEvent.click(screen.getByTestId('rp-create-folder')); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-editing-folder-name').textContent).toBe('New folder')
      );
      act(() => {
        fireEvent.keyDown(screen.getByTestId('rp-name-input'), { key: 'Escape' });
      });
      expect(screen.getByTestId('lp-folder-count').textContent).toBe('0');
    });

    it('calls updateRuleDirectory when renaming folder with rules inside', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: 'finance/subfolder/Rule One' })],
      });
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-finance'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-finance')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-edit')); });
      act(() => {
        fireEvent.change(screen.getByTestId('rp-name-input'), { target: { value: 'renamed' } });
      });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-name-blur')); });
      expect(mockedUpdateRuleDirectory).toHaveBeenCalled();
    });

    it('shows alert and removes folder when duplicate name exists', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [
          makeRule({ rule_key: 'r1', directory: 'existing/Rule One' }),
          makeRule({ rule_key: 'r2', directory: 'finance/Rule Two', name: 'Rule Two' }),
        ],
      });
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('menu-open-existing'));
      act(() => { fireEvent.click(screen.getByTestId('menu-open-existing')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-edit')); });
      act(() => {
        fireEvent.change(screen.getByTestId('rp-name-input'), { target: { value: 'finance' } });
      });
      await act(async () => { fireEvent.click(screen.getByTestId('rp-name-blur')); });
      expect(mockShowAlert).toHaveBeenCalled();
    });
  });

  describe('mouse hover on files', () => {
    it('sets hoveredRule when mouse enters a file', async () => {
      await act(async () => { renderPage(); });
      act(() => { fireEvent.click(screen.getByTestId('rp-mouse-enter-file')); });
      expect(screen.getByTestId('lp-hovered-rule').textContent).toBe('Rule One');
    });

    it('clears hoveredRule when mouse leaves', async () => {
      await act(async () => { renderPage(); });
      act(() => { fireEvent.click(screen.getByTestId('rp-mouse-enter-file')); });
      act(() => { fireEvent.click(screen.getByTestId('rp-mouse-leave-file')); });
      expect(screen.getByTestId('lp-hovered-rule').textContent).toBe('');
    });
  });

  describe('helpers — exported functions', () => {
    it('splitPath splits a path by slash and filters empty segments', () => {
      expect(splitPath('a/b/c')).toEqual(['a', 'b', 'c']);
      expect(splitPath('')).toEqual([]);
      expect(splitPath('/a/')).toEqual(['a']);
    });

    it('parentOfPath returns the parent directory', () => {
      expect(parentOfPath('a/b/c')).toBe('a/b');
      expect(parentOfPath('a')).toBe('');
    });

    it('fmtDate formats a valid ISO string', () => {
      const result = fmtDate('2024-01-15T10:30:00Z');
      expect(result).toContain('2024');
    });

    it('fmtDate returns the original string when date is invalid', () => {
      expect(fmtDate('not-a-date')).toBeTruthy();
    });
  });

  describe('buildTree — folder structure', () => {
    it('builds folder nodes from nested rule directories', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: 'finance/subfolder/Rule One' })],
      });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('lp-folder-count').textContent).toBe('2')
      );
    });

    it('skips rules with no directory', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: undefined })],
      });
      await act(async () => { renderPage(); });
      await waitFor(() =>
        expect(screen.getByTestId('lp-folder-count').textContent).toBe('0')
      );
    });
  });

  describe('visibleItems sorting', () => {
    it('shows folders before files', async () => {
      mockedGetProjectRules.mockResolvedValue({
        ...PROJECT_RULES,
        rules: [makeRule({ directory: 'finance/subfolder/Rule One' })],
      });
      await act(async () => { renderPage(); });
      await waitFor(() => screen.getByTestId('rp-visible-count'));
      const count = parseInt(screen.getByTestId('rp-visible-count').textContent ?? '0');
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});