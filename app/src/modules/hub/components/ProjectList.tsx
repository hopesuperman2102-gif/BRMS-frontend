"use client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Button, CircularProgress,
  Menu, MenuItem, Pagination, IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AccountTree from "@mui/icons-material/AccountTree";
import { projectsApi } from "app/src/modules/hub/api/projectsApi";

/* ─── Design Tokens ───────────────────────────────────────── */
const T = {
  indigo:          "#4F46E5",
  indigoHover:     "#4338CA",
  indigoMuted:     "rgba(79,70,229,0.08)",
  indigoGlow:      "rgba(79,70,229,0.18)",
  bgLeft:          "#0A0C10",
  dTextHigh:       "#FFFFFF",
  dTextMid:        "rgba(255,255,255,0.45)",
  dTextLow:        "rgba(255,255,255,0.18)",
  dBorder:         "rgba(255,255,255,0.06)",
  bgRight:         "#F7F8FA",
  lTextHigh:       "#0F172A",
  lTextMid:        "#475569",
  lTextLow:        "#94A3B8",
  lBorder:         "#E2E8F0",
  cardBg:          "#FFFFFF",
  cardHoverBorder: "#4F46E5",
};

export type Project = {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

export default function ProjectListCard() {
  const [projects, setProjects]               = useState<Project[]>([]);
  const [menuAnchorEl, setMenuAnchorEl]       = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject]   = useState<Project | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [page, setPage]                       = useState(1);

  const navigate         = useNavigate();
  const { vertical_Key } = useParams();

  useEffect(() => {
    if (!vertical_Key) return;
    const controller = new AbortController();

    // Always invalidate on mount — guarantees fresh API call every time tab is visited
    projectsApi.invalidateProjectsCache(vertical_Key);

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getVerticalProjects(vertical_Key);
        if (!controller.signal.aborted) {
          const mapped: Project[] = response.projects.map((p) => {
            const src = p.updated_at ?? p.created_at ?? '';
            return {
              id:          String(p.id),
              project_key: p.project_key,
              name:        p.name,
              description: p.description,
              domain:      p.domain,
              updatedAt:   src ? new Date(src).toLocaleString() : '',
            };
          });
          setProjects(mapped);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          console.error('Failed to load projects:', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, [vertical_Key]);

  const rowsPerPage       = 5;
  const totalPages        = Math.ceil(projects.length / rowsPerPage);
  const paginatedProjects = projects.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleMenuOpen  = (e: React.MouseEvent<HTMLElement>, project: Project) => { setMenuAnchorEl(e.currentTarget); setSelectedProject(project); };
  const handleMenuClose = () => { setMenuAnchorEl(null); setSelectedProject(null); };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await projectsApi.deleteProject(selectedProject.project_key, 'admin');
      setProjects((prev) => prev.filter((p) => p.project_key !== selectedProject.project_key));
      handleMenuClose();
    } catch (error) { console.error('Error deleting project:', error); }
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject?key=${selectedProject.project_key}`);
    handleMenuClose();
  };

  const handleOpenProject = (project: Project) =>
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project.project_key}/rules`);

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", borderRadius: "16px", overflow: "hidden", border: `1px solid ${T.dBorder}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontFamily: '"DM Sans", "Inter", sans-serif', height: "calc(100vh - 64px)" }}>

        {/* ─── LEFT PANEL ─── */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", width: "38%", flexShrink: 0, background: T.bgLeft, borderRight: `1px solid ${T.dBorder}`, position: "relative", overflow: "hidden", px: "36px", py: "32px" }}>
          <Box sx={{ position: "absolute", bottom: -80, left: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 60%)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.08, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "16px" }}>
              <Box sx={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AccountTree sx={{ fontSize: 18, color: "#818CF8" }} />
              </Box>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 800, color: T.dTextHigh, letterSpacing: "-0.025em", lineHeight: 1 }}>Projects</Typography>
            </Box>

            <Typography sx={{ fontSize: "0.8125rem", color: T.dTextMid, lineHeight: 1.75, mb: "32px", fontWeight: 400 }}>
              Manage and organize your rule projects across teams and domains.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "12px", borderBottom: `1px solid ${T.dBorder}`, mb: "24px" }}>
              <Typography sx={{ fontSize: "0.75rem", color: T.dTextMid, fontFamily: '"DM Mono", monospace', letterSpacing: "0.04em" }}>Total projects</Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: T.dTextHigh, fontFamily: '"DM Mono", monospace' }}>{projects.length}</Typography>
            </Box>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {hoveredProject ? (
                <Box>
                  <Typography sx={{ fontSize: "0.625rem", fontWeight: 700, color: T.dTextLow, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: '"DM Mono", monospace', mb: "10px" }}>Selected</Typography>
                  <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: T.dTextHigh, letterSpacing: "-0.025em", lineHeight: 1.15, mb: "12px" }}>{hoveredProject.name}</Typography>
                  <Box sx={{ width: "24px", height: "2px", borderRadius: "1px", background: T.indigo, mb: "12px", opacity: 0.7 }} />
                  <Typography sx={{ fontSize: "0.8125rem", color: T.dTextMid, lineHeight: 1.75, fontWeight: 400 }}>{hoveredProject.description || "No description provided for this project."}</Typography>
                  {hoveredProject.domain && (
                    <Box sx={{ mt: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Box sx={{ width: "4px", height: "4px", borderRadius: "50%", bgcolor: T.indigo, opacity: 0.6 }} />
                      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(129,140,248,0.8)", fontFamily: '"DM Mono", monospace', letterSpacing: "0.07em", textTransform: "uppercase" }}>{hoveredProject.domain}</Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ opacity: 0.3 }}>
                  <Typography sx={{ fontSize: "0.625rem", fontWeight: 700, color: T.dTextLow, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: '"DM Mono", monospace', mb: "10px" }}>Preview</Typography>
                  <Typography sx={{ fontSize: "0.8125rem", color: T.dTextMid, lineHeight: 1.75 }}>Hover a project to see its details here.</Typography>
                </Box>
              )}
            </Box>

            <Typography sx={{ fontSize: "0.625rem", color: T.dTextLow, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: '"DM Mono", monospace', mt: "32px" }}>BRMS Platform · 2025</Typography>
          </Box>
        </Box>

        {/* ─── RIGHT PANEL ─── */}
        <Box sx={{ flex: 1, background: T.bgRight, display: "flex", flexDirection: "column", px: { xs: "20px", sm: "32px" }, py: "28px", overflow: "hidden" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px", flexShrink: 0 }}>
            <Box>
              <Box sx={{ width: "28px", height: "2px", borderRadius: "1px", background: T.indigo, mb: "10px" }} />
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 800, color: T.lTextHigh, letterSpacing: "-0.025em", lineHeight: 1.1, mb: "4px" }}>All Projects</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: T.lTextMid, fontWeight: 400, lineHeight: 1.6 }}>Select a project to manage its rules</Typography>
            </Box>
            <Button
              variant="contained"
              disableRipple
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject`)}
              sx={{ background: T.indigo, borderRadius: "6px", px: "16px", py: "8px", textTransform: "none", fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.01em", boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${T.indigoGlow}`, whiteSpace: "nowrap", flexShrink: 0, ml: "16px", "&:hover": { background: T.indigoHover, boxShadow: `0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)`, transform: "translateY(-1px)" }, transition: "all 0.15s" }}
            >
              + New Project
            </Button>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
                <CircularProgress size={28} sx={{ color: T.indigo }} />
              </Box>
            ) : paginatedProjects.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px" }}>
                <Box sx={{ width: "48px", height: "48px", borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FolderOpenIcon sx={{ fontSize: 24, color: T.lTextLow }} />
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 700, color: T.lTextHigh, fontSize: "0.9375rem", mb: "4px", letterSpacing: "-0.01em" }}>No projects yet</Typography>
                  <Typography sx={{ color: T.lTextMid, fontSize: "0.8125rem" }}>Get started by creating your first project</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {paginatedProjects.map((project) => (
                  <Box
                    key={project.id}
                    onClick={() => handleOpenProject(project)}
                    onMouseEnter={() => setHoveredProject(project)}
                    onMouseLeave={() => setHoveredProject(null)}
                    sx={{ borderRadius: "8px", border: `1px solid ${T.lBorder}`, backgroundColor: T.cardBg, px: "16px", py: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.15s", "&:hover": { borderColor: T.cardHoverBorder, boxShadow: `0 0 0 3px ${T.indigoMuted}`, transform: "translateY(-1px)" } }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <Box sx={{ width: "8px", height: "8px", borderRadius: "50%", bgcolor: T.indigo, flexShrink: 0, opacity: 0.7 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: T.lTextHigh, fontSize: "0.9375rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: "3px" }}>{project.name}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Typography sx={{ color: T.lTextLow, fontSize: "0.75rem", fontFamily: '"DM Mono", monospace' }}>Updated</Typography>
                          <Typography sx={{ color: T.lTextMid, fontSize: "0.75rem", fontWeight: 500, fontFamily: '"DM Mono", monospace' }}>{project.updatedAt}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      {project.domain && (
                        <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: T.indigo, background: T.indigoMuted, border: `1px solid rgba(79,70,229,0.15)`, borderRadius: "4px", px: "8px", py: "3px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: '"DM Mono", monospace', lineHeight: 1.4 }}>{project.domain}</Typography>
                      )}
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, project); }} disableRipple sx={{ width: "30px", height: "30px", borderRadius: "6px", color: T.lTextLow, "&:hover": { backgroundColor: "#F1F5F9", color: T.lTextMid }, transition: "all 0.15s" }}>
                        <MoreVertIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: "20px", flexShrink: 0 }}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} sx={{ "& .MuiPaginationItem-root": { borderRadius: "6px", fontWeight: 600, fontSize: "0.8125rem", fontFamily: '"DM Mono", monospace', color: T.lTextMid, "&.Mui-selected": { background: T.indigo, color: "#fff", "&:hover": { background: T.indigoHover } }, "&:hover": { background: "#F1F5F9" } } }} />
            </Box>
          )}
        </Box>
      </Box>

      <Menu anchorEl={menuAnchorEl} open={!!menuAnchorEl} onClose={handleMenuClose} sx={{ "& .MuiPaper-root": { borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", minWidth: "140px", border: `1px solid ${T.lBorder}` } }}>
        <MenuItem onClick={handleEdit} sx={{ fontSize: "0.8125rem", fontWeight: 500, color: T.lTextHigh, py: "10px", px: "16px", "&:hover": { backgroundColor: "#F8FAFC" } }}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "#DC2626", py: "10px", px: "16px", "&:hover": { backgroundColor: "#FEF2F2" } }}>Delete</MenuItem>
      </Menu>
    </>
  );
}