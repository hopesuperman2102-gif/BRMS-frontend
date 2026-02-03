"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography } from "@mui/material";

import CdfTable from "../../../core/components/CdfTable";
import {
  projectRulesMock,
  projectsMock,
  RuleFile,
} from "../../../core/components/mock_data"; // adjust path if needed
import SectionHeader from "app/src/core/components/SectionHeader";

export default function ProjectRuleComponent() {
  const { folderId } = useParams<{ folderId: string }>();
  const router = useRouter();

  const [rules, setRules] = useState<RuleFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  /* ---------- Mock API (replace later) ---------- */
  useEffect(() => {
    setRules(projectRulesMock);
  }, [folderId]);

  const project = projectsMock.find((p) => p.id.toString() === folderId);

  /* ---------- Table Headers ---------- */
  const headers = ["File Name", "ID", "Version", "Status", "Last updated"];

  /* ---------- Table Rows ---------- */
  const rows = rules.map((rule) => ({
    "File Name": rule.name,
    ID: rule.id,
    Version: rule.version,
    Status: rule.status,
    "Last updated": rule.updatedAt,
  }));

  /* ---------- Row Click ---------- */
  const handleRowClick = (_: any, index: number) => {
    setSelectedIndex(index);

    const selectedRule = rules[index];
    router.push(`/dashboard/${folderId}/rules/${selectedRule.id}/editor`);
  };

  return (
    <Card>
      <CardContent>
        {/* ---------- Header (fixed) ---------- */}
        <SectionHeader
          left={
            <Typography variant="h6">
              {project?.name ?? `Project ${folderId}`}
            </Typography>
          }
        />

        {/* ---------- Scrollable Table ONLY ---------- */}
        <Box
          sx={{
            maxHeight: 500,
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <CdfTable
            headers={headers}
            rows={rows}
            selectedRowIndex={selectedIndex}
            onRowClick={handleRowClick}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
