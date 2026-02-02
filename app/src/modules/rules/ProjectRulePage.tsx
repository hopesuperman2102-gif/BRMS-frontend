'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography } from '@mui/material';

import CdfTable from '../../core/components/CdfTable';
import {
  projectRulesMock,
  RuleFile,
} from '../../core/components/mock_data'; // adjust path if needed

export default function ProjectRulePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [rules, setRules] = useState<RuleFile[]>([]);
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  /* ---------- Mock API (replace later) ---------- */
  useEffect(() => {
    setRules(projectRulesMock);
  }, [projectId]);

  /* ---------- Table Headers ---------- */
  const headers = [
    'File Name',
    'ID',
    'Version',
    'Status',
    'Last updated',
  ];

  /* ---------- Table Rows ---------- */
  const rows = rules.map((rule) => ({
    'File Name' : rule.name,
    'ID': rule.id,
    Version: rule.version,
    Status: rule.status,
    'Last updated': rule.updatedAt,
  }));

  /* ---------- Row Click ---------- */
  const handleRowClick = (_: any, index: number) => {
    setSelectedIndex(index);

    const selectedRule = rules[index];
    console.log('Selected rule:', selectedRule);

    // later:
    // router.push(`/projects/${projectId}/rules?file=${selectedRule.id}`);
  };

  return (
    <Card>
      <CardContent
        sx={{
          maxHeight: 700,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* ---------- Header ---------- */}
        <Box mb={2}>
          <Typography variant="h6">
            {projectId}
          </Typography>
        </Box>

        {/* ---------- Table ---------- */}
        <CdfTable
          headers={headers}
          rows={rows}
          selectedRowIndex={selectedIndex}
          onRowClick={handleRowClick}
        />
      </CardContent>
    </Card>
  );
}
