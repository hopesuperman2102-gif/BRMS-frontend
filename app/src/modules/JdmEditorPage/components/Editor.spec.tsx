import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Editor from './Editor';
import { ruleVersionsApi } from '@/modules/JdmEditorPage/api/ruleVersionsApi';
import { useAlertStore } from '@/core/components/RcAlertComponent';
import { RepoItem } from '../types/JdmEditorTypes';

// ─── Mock Dependencies ────────────────────────────────────────────────────────

vi.mock('@/modules/JdmEditorPage/api/ruleVersionsApi', () => ({
  ruleVersionsApi: {
    listVersions: vi.fn(),
    getVersionData: vi.fn(),
    createVersion: vi.fn(),
  },
}));

vi.mock('@/core/components/RcAlertComponent', () => ({
  useAlertStore: vi.fn(),
}));

vi.mock('@/modules/JdmEditorPage/components/JdmEditorComponent', () => ({
  default: () => <div data-testid="jdm-editor">Editor Loaded</div>,
}));

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockItems: RepoItem[] = [
  { id: '1', name: 'Rule 1', type: 'file' },
];

const mockVersions = [
  {
    version: 'v2',
    checksum: 'abc',
    is_valid: true,
    created_by: 'user',
    created_at: 'date',
    jdm: { nodes: [], edges: [] },
  },
  {
    version: 'v1',
    checksum: 'xyz',
    is_valid: true,
    created_by: 'user',
    created_at: 'date',
  },
];

const mockShowAlert = vi.fn();

const defaultProps = {
  items: mockItems,
  selectedId: '1',
  openFiles: [],
  setOpenFiles: vi.fn(),
  onSimulatorRun: vi.fn(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // 🔥 silence console errors
  vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.mocked(useAlertStore).mockReturnValue({
    showAlert: mockShowAlert,
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Editor Component', () => {
  it('renders empty state when no rule selected', () => {
    render(<Editor {...defaultProps} selectedId={null} />);
    expect(screen.getByText(/No rule selected/i)).toBeInTheDocument();
  });

  it('fetches and displays versions on mount', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue(mockVersions);

    render(<Editor {...defaultProps} />);

    await waitFor(() => {
      expect(ruleVersionsApi.listVersions).toHaveBeenCalledWith('1');
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('v2');
  });

  it('handles no versions and initializes empty graph', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue([]);

    render(<Editor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('jdm-editor')).toBeInTheDocument();
    });
  });

  it('uses existing jdm without calling API on version change', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue(mockVersions);

    render(<Editor {...defaultProps} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.mouseDown(screen.getByRole('combobox'));
    const options = await screen.findAllByRole('option');
    fireEvent.click(options.find(o => o.textContent === 'v2')!);

    expect(ruleVersionsApi.getVersionData).not.toHaveBeenCalled();
  });

  it('fetches version data when jdm not present', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue([
      { ...mockVersions[1], jdm: undefined },
    ]);

    vi.mocked(ruleVersionsApi.getVersionData).mockResolvedValue({
      jdm: { nodes: [], edges: [] },
    });

    render(<Editor {...defaultProps} />);

    await waitFor(() => {
      expect(ruleVersionsApi.getVersionData).toHaveBeenCalled();
    });
  });

  it('handles version change', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue(mockVersions);

    render(<Editor {...defaultProps} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.mouseDown(screen.getByRole('combobox'));
    const options = await screen.findAllByRole('option');
    fireEvent.click(options.find(o => o.textContent === 'v1')!);

    expect(screen.getByRole('combobox')).toHaveTextContent('v1');
  });

  it('falls back to empty graph when API fails', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockRejectedValue(new Error('fail'));

    render(<Editor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('jdm-editor')).toBeInTheDocument();
    });
  });

  it('shows empty state for folder selection', () => {
    const folderItems: RepoItem[] = [
      { id: '1', name: 'Folder', type: 'folder' },
    ];

    render(<Editor {...defaultProps} items={folderItems} selectedId="1" />);

   expect(screen.getByText(/No rule selected/i)).toBeInTheDocument();
  });

  it('commits changes successfully', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue(mockVersions);
    vi.mocked(ruleVersionsApi.createVersion).mockResolvedValue(mockVersions[0]);

    render(<Editor {...defaultProps} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.click(screen.getByRole('button', { name: /commit/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        'Changes committed successfully!',
        'success'
      );
    });
  });

  it('shows error on commit failure', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue(mockVersions);
    vi.mocked(ruleVersionsApi.createVersion).mockRejectedValue(new Error('fail'));

    render(<Editor {...defaultProps} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.click(screen.getByRole('button', { name: /commit/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        'Failed to commit changes. Please try again.',
        'error'
      );
    });
  });

  it('disables commit button for reviewer', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockResolvedValue(mockVersions);

    render(<Editor {...defaultProps} isReviewer />);

    await waitFor(() => screen.getByRole('combobox'));

    expect(
      screen.queryByRole('button', { name: /commit/i })
    ).not.toBeInTheDocument();
  });

  it('shows loading state while fetching versions', () => {
    vi.mocked(ruleVersionsApi.listVersions).mockImplementation(
      () => new Promise(() => {})
    );

    render(<Editor {...defaultProps} />);

    expect(screen.getAllByText(/Loading versions/i).length).toBeGreaterThan(0);
  });

  it('handles API failure gracefully', async () => {
    vi.mocked(ruleVersionsApi.listVersions).mockRejectedValue(new Error('error'));

    render(<Editor {...defaultProps} />);

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        'Error fetching versions',
        'error'
      );
    });
  });
});