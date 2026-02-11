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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import CdfTable from "../../../core/components/CdfTable";
import SectionHeader from "app/src/core/components/SectionHeader";
import { CreateModal } from "../../../core/components/CreateModal";
import { rulesApi } from "app/src/api/rulesApi";
import { projectsApi } from "app/src/api/projectsApi";
import { RuleFile } from "../../rules/pages/types/rulesTypes";

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
  type ApiRule = {
    rule_key: string;
    name: string;
    status: string;
    updated_at: string;
  };
 
  const loadRules = useCallback(async () => {
    if (!project_key) return;
    try {
      const data = (await rulesApi.getProjectRules(project_key)) as ApiRule[];
 
      // Fetch versions for each rule in parallel
      const rulesWithVersions = await Promise.all(
        data.map(async (item) => {
          try {
            const versions = await rulesApi.getRuleVersions(item.rule_key);
 
            // Pick latest version (first item since backend returns latest first)
            const latestVersion =
              versions && versions.length > 0 ? versions[0].version : "-";
 
            return {
              id: item.rule_key,
              name: item.name,
              version: latestVersion,
              status: item.status as RuleFile["status"],
              updatedAt: item.updated_at,
            } as RuleFile;
          } catch {
            // Fail-safe: don’t break UI if version API fails
            return {
              id: item.rule_key,
              name: item.name,
              version: "-",
              status: item.status as RuleFile["status"],
              updatedAt: item.updated_at,
            } as RuleFile;
          }
        })
      );
 
      setRules(rulesWithVersions);
    } catch (error) {
      console.error("Error loading rules:", error);
    }
  }, [project_key]);
 
  useEffect(() => {
    if (!project_key) return;

    const timeoutId = setTimeout(() => {
      void loadRules();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [project_key, loadRules]);

  /* ---------- Menu handlers ---------- */
  const openMenu = (
    e: React.MouseEvent<HTMLElement>,
    rule: RuleFile
  ) => {
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
          if (!project_key) return;
          sessionStorage.setItem("activeRuleName", rule.name);
          sessionStorage.setItem("activeRuleId", rule.id);
          navigate(`/dashboard/${project_key}/rules/editor?rule=${rule.id}`);
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
      // Check for duplicate rule name
      const existingRules = (await rulesApi.getProjectRules(project_key)) as {
        rule_key: string;
        name: string;
      }[];
      
      if (editRule) {
        // When editing: check if name exists in OTHER rules 
        const nameExistsInOtherRule = existingRules.some((r) => {
          const normalizedName = r.name.toLowerCase().trim();
          return (
            r.rule_key !== editRule.id &&
            normalizedName === data.name.toLowerCase().trim()
          );
        });

        if (nameExistsInOtherRule) {
          return {
            success: false,
            error: "Rule name already exists. Please use a different name.",
          };
        }

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
        // When creating: check if name exists in ANY rule
        const nameExists = existingRules.some((r) => {
          const normalizedName = r.name.toLowerCase().trim();
          return normalizedName === data.name.toLowerCase().trim();
        });

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
      console.error("Error creating/updating rule:", error);
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => navigate("/dashboard")}
                sx={{
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
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
            </Box>
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

        {/* ---------- Create / Edit Modal ---------- */}
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