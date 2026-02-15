'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AlertComponent from '../../../core/components/Alert';
import { RepoItem, JsonObject } from '../../../core/types/commonTypes';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import Editor from './Editor';
import { rulesApi } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { executionApi } from 'app/src/modules/JdmEditorPage/api/executionApi';
import RepositorySidebar from 'app/src/core/components/RepositorySidebar';

export default function JdmEditorWithSimulator() {
  const { project_key } = useParams<{ project_key: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verticalId } = useParams(); 

  const [items, setItems] = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openFiles, setOpenFiles] = useState<number[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [projectName, setProjectName] = useState<string>('');

  /* ---------- Fetch project name ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchProject = async () => {
      try {
        const projects = await projectsApi.getProjectsView();
        const project = projects.find(
          (p) => p.project_key === project_key
        );
        if (project?.name) setProjectName(project.name);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [project_key]);

  /* ---------- Fetch rules list only (without graph data) ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchRules = async () => {
      try {
        type ApiRule = {
          rule_key: number;
          name: string;
        };

        const data = (await rulesApi.getProjectRules(project_key)) as ApiRule[];

        // Don't load graph here - just basic info
        const treeItems: RepoItem[] = data.map((rule) => ({
          id: rule.rule_key,
          name: rule.name,
          type: 'file' as const,
          graph: undefined, // Graph is loaded lazily per version
        }));

        setItems(treeItems);

        // Check URL parameter first, then sessionStorage
        const ruleFromUrl = searchParams.get('rule');
        const ruleIdToSelect = ruleFromUrl || sessionStorage.getItem('activeRuleId');
        
        if (ruleIdToSelect) {
          const foundRule = treeItems.find((item) => String(item.id) === ruleIdToSelect);
          if (foundRule) {
            setSelectedId(foundRule.id);
            setOpenFiles([foundRule.id]);
            sessionStorage.setItem('activeRuleId', String(foundRule.id));
            sessionStorage.setItem('activeRuleName', foundRule.name);
          }
        }
      } catch (error) {
        console.error('Error fetching rules:', error);
      }
    };

    fetchRules();
  }, [project_key, searchParams]);

  const handleSelectItem = (item: RepoItem) => {
    if (item.type === 'file') {
      setSelectedId(item.id);
      if (!openFiles.includes(item.id)) {
        setOpenFiles([...openFiles, item.id]);
      }
      // Store in sessionStorage
      sessionStorage.setItem('activeRuleId', String(item.id));
      sessionStorage.setItem('activeRuleName', item.name);
      
      // Update URL with rule parameter
      navigate(`/vertical/${verticalId}/dashboard/hub/${project_key}/rules/editor?rule=${item.id}`, {
        replace: true,
      });
    }
  };

  const handleToggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = () => {
    // Drag-and-drop not implemented yet
  };

  const handleDropOnFolder = () => {
    // Drag-and-drop not implemented yet
  };

  /* ---------- Simulator API Call ---------- */
  const handleSimulatorRun = async (
    jdm: DecisionGraphType,
    context: JsonObject
  ) => {
    console.log('Running simulation with context:', context);
    console.log('Current JDM graph:', jdm);
    
    try {
      const result = await executionApi.execute(jdm, context);
      console.log('Execution result:', result);
      return result;
    } catch (error) {
      console.error('Error executing simulation:', error);
      throw error;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        p: 2,
      }}
    >
      {/* Card Wrapper */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 32px)',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Container with Border */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
          }}
        >
          <RepositorySidebar
            projectName={projectName}
            items={items}
            selectedId={selectedId}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            onSelectItem={handleSelectItem}
            onAddClick={() => {}}
            onDragStart={handleDragStart}
            onDropOnFolder={handleDropOnFolder}
            onBackClick={() => {
              if (project_key) {
                navigate(`/vertical/${verticalId}/dashboard/hub/${project_key}/rules`);
              }
            }}
          />
        </Box>

        {/* Editor Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Editor
            items={items}
            selectedId={selectedId}
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            onSimulatorRun={handleSimulatorRun}
          />
        </Box>
      </Box>

      <AlertComponent />
    </Box>
  );
}