"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import CdfTable from "../../../core/components/CdfTable";
import SectionHeader from "app/src/core/components/SectionHeader";
import { CreateModal } from "../../../core/components/CreateModal";
import { rulesApi } from "app/src/modules/rules/api/rulesApi";
import { projectsApi } from "app/src/modules/hub/api/projectsApi";
import { RuleFile } from "../../rules/pages/types/rulesTypes";

type ApiRule = {
  rule_key: string;
  name: string;
  status: string;
  created_at: string;
};

export default function ProjectRuleComponent() {
  const { project_key } = useParams<{ project_key: string }>();
  const navigate = useNavigate();

  const [rules, setRules] = useState<RuleFile[]>([]);
  const [selectedIndex] = useState<number | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [editRule, setEditRule] = useState<RuleFile | null>(null);

  const [projectName, setProjectName] = useState<string>("");

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuRule, setMenuRule] = useState<RuleFile | null>(null);

  const mapRuleStatus = (status: string): RuleFile["status"] => {
    const upper = status.toUpperCase();
    if (upper === "ACTIVE") return "Active";
    if (upper === "ARCHIVED") return "Archived";
    return "Draft";
  };

  const loadRules = useCallback(async () => {
    if (!project_key) return;
    try {
      const data = (await rulesApi.getProjectRules(project_key)) as ApiRule[];

      setRules(
        data.map((item) => ({
          id: item.rule_key,
          name: item.name,
          version: "-",
          status: mapRuleStatus(item.status),
          updatedAt: item.created_at,
        }))
      );
    } catch (error) {
      console.error("Error loading rules:", error);
    }
  }, [project_key]);

  /* ---------- Fetch PROJECT NAME ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchProjectName = async () => {
      try {
        const projects = await projectsApi.getProjectsView();
        const project = projects.find((p) => p.project_key === project_key);
        if (project?.name) setProjectName(project.name);
      } catch (err) {
        console.error("Project fetch error", err);
      }
    };

    fetchProjectName();
  }, [project_key]);

  /* ---------- Fetch RULES ---------- */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRules();
  }, [loadRules]);

  /* ---------- Menu handlers ---------- */
  const openMenu = (e: React.MouseEvent<HTMLElement>, rule: RuleFile) => {
    setAnchorEl(e.currentTarget);
    setMenuRule(rule);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuRule(null);
  };

  /* ---------- Delete ---------- */
  const handleDelete = async () => {
    if (!menuRule) return;
    try {
      await rulesApi.deleteRule(menuRule.id);
      closeMenu();
      loadRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  /* ---------- Edit ---------- */
  const handleEdit = () => {
    setEditRule(menuRule);
    closeMenu();
  };

  /* ---------- Table ---------- */
  const headers = ["Rule Name", "Version", "Status", "Last updated", ""];

  const rows = rules.map((rule) => ({
    "Rule Name": (
      <Typography
        sx={{
          color: "#4f46e5",
          cursor: "pointer",
          fontWeight: 500,
          "&:hover": { textDecoration: "underline" },
        }}
        onClick={() => {
          sessionStorage.setItem("activeRuleName", rule.name);
          sessionStorage.setItem("activeRuleId", rule.id);
          navigate(`/hub/${project_key}/rules/editor`);
        }}
      >
        {rule.name}
      </Typography>
    ),
    Version: rule.version,
    Status: rule.status,
    "Last updated": rule.updatedAt,
    "": (
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          openMenu(e, rule);
        }}
      >
        <MoreVertIcon />
      </IconButton>
    ),
  }));

  /* ---------- Create / Update ---------- */
  const handleCreateOrUpdate = async (
    data: { [key: string]: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!project_key) {
      return { success: false, error: "Project key is missing" };
    }
    try {
      if (editRule) {
        // Update existing rule
        await rulesApi.updateRule({
          rule_key: editRule.id,
          name: data.name,
          description: data.description,
          updated_by: "admin",
        });
        setEditRule(null);
        loadRules();
        return { success: true };
      } else {
        // Check for duplicate rule name before creating
        const existingRules = await rulesApi.getProjectRules(project_key) as { name: string }[];
        const nameExists = existingRules.some(
          (r) => r.name.toLowerCase().trim() === data.name.toLowerCase().trim()
        );

        if (nameExists) {
          return {
            success: false,
            error: "Rule name already exists. Please use a different name.",
          };
        }

        // Create new rule
        await rulesApi.createRule({
          project_key,
          name: data.name,
          description: data.description,
        });
        loadRules();
        return { success: true };
      }
    } catch (error: unknown) {
      console.error("Error in handleCreateOrUpdate:", error);
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return {
        success: false,
        error: message,
      };
    }
  };

  return (
    <Card>
      <CardContent>
        <SectionHeader
          left={
            <Typography variant="h6">
              {projectName ? (
                projectName
              ) : (
                <Skeleton
                  variant="text"
                  width={120}
                  sx={{ display: "inline-block" }}
                />
              )}
            </Typography>
          }
          right={
            <Button variant="contained" onClick={() => setOpenCreate(true)}>
              CREATE RULE
            </Button>
          }
        />

        <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
          <CdfTable
            headers={headers}
            rows={rows}
            selectedRowIndex={selectedIndex}
            onRowClick={() => {}}
          />
        </Box>

        {/* ---------- Three-dot Menu ---------- */}
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            Delete
          </MenuItem>
        </Menu>

        <CreateModal
          open={openCreate || !!editRule}
          onClose={() => {
            setOpenCreate(false);
            setEditRule(null);
          }}
          title={editRule ? "Edit Rule" : "Create Rule"}
          fields={[
            { name: "name", label: "Rule Name" },
            { name: "description", label: "Description" },
          ]}
          onCreate={handleCreateOrUpdate}
        />
      </CardContent>
    </Card>
  );
}