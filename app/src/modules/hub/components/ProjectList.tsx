"use client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Button, CircularProgress,
  Menu, MenuItem, Pagination, IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AccountTree from "@mui/icons-material/AccountTree";
import { projectsApi } from "app/src/modules/hub/api/projectsApi";
import { ProjectListProps } from "../types/projectListTypes";
import { brmsTheme } from "app/src/core/theme/brmsTheme";

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */

const RootWrapper = styled(Box)({
  width: "100%", display: "flex",
  borderRadius: "16px",
  overflow: "hidden",
  border: `1px solid ${colors.panelBorder}`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  fontFamily: fonts.sans,
  height: "calc(100vh - 64px)",
});

const LeftPanel = styled(Box)({
  display: "none",
  "@media (min-width: 900px)": { display: "flex" },
  flexDirection: "column",
  width: "38%",
  flexShrink: 0,
  background: colors.panelBg,
  borderRight: `1px solid ${colors.panelBorder}`,
  position: "relative",
  overflow: "hidden",
  padding: "32px 36px",
});

const LeftVignette = styled(Box)({
  position: "absolute",
  bottom: -80,
  left: -80,
  width: 360,
  height: 360,
  borderRadius: "50%",
  pointerEvents: "none",
  background: "radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 60%)",
});

const LeftDotGrid = styled(Box)({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  opacity: 0.08,
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
});

const LeftContent = styled(Box)({ position: "relative", zIndex: 1, display: "flex", flexDirection: "column",
  height: "100%",
});

const LeftTitleRow = styled(Box)({
  display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
});

const ProjectsIconBox = styled(Box)({
  width: 36,
  height: 36,
  borderRadius: "8px",
  flexShrink: 0,
  background: colors.panelIndigoTint15,
  border: `1px solid ${colors.panelIndigoTint25}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const LeftTitleText = styled(Typography)({
  fontSize: "1.125rem",
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: "-0.025em",
  lineHeight: 1,
});

const LeftSubtitle = styled(Typography)({
  fontSize: "0.8125rem",
  color: colors.panelTextMid,
  lineHeight: 1.75,
  marginBottom: 32,
});

const StatsRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: `1px solid ${colors.panelBorder}`,
  marginBottom: 24,
});

const StatsLabel = styled(Typography)({
  fontSize: "0.75rem",
  color: colors.panelTextMid,
  fontFamily: fonts.mono,
  letterSpacing: "0.04em",
});

const StatsValue = styled(Typography)({
  fontSize: "0.875rem", fontWeight: 700, color: colors.textOnPrimary, fontFamily: fonts.mono,
});

const PreviewArea = styled(Box)({
  flex: 1,
});

const PreviewDimLabel = styled(Typography)({
  fontSize: "0.625rem",
  fontWeight: 700,
  color: colors.panelTextLow,
  fontFamily: fonts.mono,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 10,
});

const PreviewName = styled(Typography)({
  fontSize: "1.05rem",
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: "-0.025em",
  lineHeight: 1.15,
  marginBottom: 12,
});

const PreviewAccentLine = styled(Box)({
  width: 24,
  height: 2,
  borderRadius: 1,
  background: colors.panelIndigo,
  marginBottom: 12,
  opacity: 0.7,
});

const PreviewBody = styled(Typography)({
  fontSize: "0.8125rem", color: colors.panelTextMid, lineHeight: 1.75,
});

const DomainTag = styled(Box)({
  marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
});

const DomainDot = styled(Box)({
  width: 4, height: 4, borderRadius: "50%", backgroundColor: colors.panelIndigo, opacity: 0.6,
});

const DomainTagText = styled(Typography)({
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: colors.indigoLightMuted,
  fontFamily: fonts.mono,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
});

const PlaceholderBox = styled(Box)({
  opacity: 0.3,
});

const LeftFooter = styled(Typography)({
  fontSize: "0.625rem",
  color: colors.panelTextLow,
  fontWeight: 500,
  fontFamily: fonts.mono,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginTop: 32,
});

// ── Right Panel ──

const RightPanel = styled(Box)({
  flex: 1,
  background: colors.formBg,
  display: "flex",
  flexDirection: "column",
  padding: "28px 32px",
  overflow: "hidden",
});

const RightHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
  flexShrink: 0,
});

const HeaderAccentLine = styled(Box)({
  width: 28,
  height: 2,
  borderRadius: 1,
  background: colors.panelIndigo,
  marginBottom: 10,
});

const RightTitle = styled(Typography)({
  fontSize: "1.125rem",
  fontWeight: 800,
  color: colors.lightTextHigh,
  letterSpacing: "-0.025em",
  lineHeight: 1.1,
  marginBottom: 4,
});

const RightSubtitle = styled(Typography)({
  fontSize: "0.8125rem",
  color: colors.lightTextMid,
  lineHeight: 1.6,
});

const NewProjectButton = styled(Button)({
  background: colors.panelIndigo,
  borderRadius: "6px",
  padding: "8px 16px",
  textTransform: "none",
  fontSize: "0.8125rem",
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
  flexShrink: 0,
  marginLeft: 16,
  boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${colors.panelIndigoGlowMid}`,
  transition: "all 0.15s",
  "&:hover": {
    background: colors.panelIndigoHover,
    boxShadow: "0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)",
    transform: "translateY(-1px)",
  },
});

const ScrollArea = styled(Box)({
  flex: 1, overflow: "auto",
});

const CenteredBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 200,
});

const EmptyBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: 200,
  gap: 12,
});

const EmptyIconBox = styled(Box)({
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: colors.lightSurfaceHover,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const EmptyTextCenter = styled(Box)({
  textAlign: "center",
});

const EmptyTitle = styled(Typography)({
  fontWeight: 700,
  color: colors.lightTextHigh,
  fontSize: "0.9375rem",
  marginBottom: 4,
  letterSpacing: "-0.01em",
});

const EmptySubtitle = styled(Typography)({
  color: colors.lightTextMid, fontSize: "0.8125rem",
});

const CardsList = styled(Box)({
  display: "flex", flexDirection: "column", gap: 8,
});

const ProjectCard = styled(Box)({
  borderRadius: "8px",
  border: `1px solid ${colors.lightBorder}`,
  backgroundColor: colors.white,
  padding: "14px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.15s",
  "&:hover": {
    borderColor: colors.panelIndigo,
    boxShadow: `0 0 0 3px ${colors.panelIndigoMuted}`,
    transform: "translateY(-1px)",
  },
});

const CardLeft = styled(Box)({
  display: "flex", alignItems: "center", gap: 12, flex: 1,
});

const CardDot = styled(Box)({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: colors.panelIndigo,
  flexShrink: 0,
  opacity: 0.7,
});

const CardName = styled(Typography)({
  fontWeight: 600,
  color: colors.lightTextHigh,
  fontSize: "0.9375rem",
  letterSpacing: "-0.01em",
  lineHeight: 1.2,
  marginBottom: 3,
});

const CardUpdatedRow = styled(Box)({
  display: "flex", gap: 4,
});

const CardUpdatedLabel = styled(Typography)({
  color: colors.lightTextLow, fontSize: "0.75rem", fontFamily: fonts.mono,
});

const CardUpdatedValue = styled(Typography)({
  color: colors.lightTextMid,
  fontSize: "0.75rem",
  fontWeight: 500,
  fontFamily: fonts.mono,
});

const CardRight = styled(Box)({
  display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
});

const DomainBadge = styled(Typography)({
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: colors.panelIndigo,
  background: colors.panelIndigoMuted,
  border: `1px solid rgba(79,70,229,0.15)`,
  borderRadius: "4px",
  padding: "3px 8px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontFamily: fonts.mono,
  lineHeight: 1.4,
});

const CardMenuButton = styled(IconButton)({
  width: 30,
  height: 30,
  borderRadius: "6px",
  color: colors.lightTextLow,
  transition: "all 0.15s",
  "&:hover": {
    backgroundColor: colors.lightSurfaceHover,
    color: colors.lightTextMid,
  },
});

const PaginationRow = styled(Box)({
  display: "flex", justifyContent: "center", marginTop: 20, flexShrink: 0,
});

const StyledPagination = styled(Pagination)({
  "& .MuiPaginationItem-root": {
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "0.8125rem",
    fontFamily: fonts.mono,
    color: colors.lightTextMid,
    "&.Mui-selected": {
      background: colors.panelIndigo,
      color: colors.white,
      "&:hover": {
        background: colors.panelIndigoHover,
      },
    },
    "&:hover": {
      background: colors.lightSurfaceHover,
    },
  },
});

const StyledMenu = styled(Menu)({
  "& .MuiPaper-root": {
    borderRadius: "8px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    minWidth: 140,
    border: `1px solid ${colors.lightBorder}`,
  },
});

const EditMenuItem = styled(MenuItem)({
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: colors.lightTextHigh,
  padding: "10px 16px",
  "&:hover": {
    backgroundColor: "#F8FAFC",
  },
});

const DeleteMenuItem = styled(MenuItem)({
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: colors.deleteRed,
  padding: "10px 16px",
  "&:hover": {
    backgroundColor: colors.errorBg,
  },
});

/* ─── Component ───────────────────────────────────────────── */

export default function ProjectListCard() {
  const [projects, setProjects]               = useState<ProjectListProps[]>([]);
  const [menuAnchorEl, setMenuAnchorEl]       = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectListProps | null>(null);
  const [hoveredProject, setHoveredProject]   = useState<ProjectListProps | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [page, setPage]                       = useState(1);

  const navigate         = useNavigate();
  const { vertical_Key } = useParams();

  useEffect(() => {
    if (!vertical_Key) return;
    const controller = new AbortController();
    projectsApi.invalidateProjectsCache(vertical_Key);

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getVerticalProjects(vertical_Key);
        if (!controller.signal.aborted) {
          const mapped: ProjectListProps[] = response.projects.map((p) => {
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
        if (!controller.signal.aborted) console.error('Failed to load projects:', error);
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

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, p: ProjectListProps) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedProject(p);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await projectsApi.deleteProject(selectedProject.project_key, 'admin');
      setProjects((prev) => prev.filter((p) => p.project_key !== selectedProject.project_key));
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject?key=${selectedProject.project_key}`);
    handleMenuClose();
  };

  const handleOpenProject = (p: ProjectListProps) =>
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${p.project_key}/rules`);

  return (
    <>
      <RootWrapper>

        {/* ─── LEFT PANEL ─── */}
        <LeftPanel>
          <LeftVignette />
          <LeftDotGrid />
          <LeftContent>
            <LeftTitleRow>
              <ProjectsIconBox>
                <AccountTree sx={{ fontSize: 18, color: colors.indigoLight }} />
              </ProjectsIconBox>
              <LeftTitleText>Projects</LeftTitleText>
            </LeftTitleRow>

            <LeftSubtitle>
              Manage and organize your rule projects across teams and domains.
            </LeftSubtitle>

            <StatsRow>
              <StatsLabel>Total projects</StatsLabel>
              <StatsValue>{projects.length}</StatsValue>
            </StatsRow>

            <PreviewArea>
              {hoveredProject ? (
                <Box>
                  <PreviewDimLabel>Selected</PreviewDimLabel>
                  <PreviewName>{hoveredProject.name}</PreviewName>
                  <PreviewAccentLine />
                  <PreviewBody>
                    {hoveredProject.description || "No description provided for this project."}
                  </PreviewBody>
                  {hoveredProject.domain && (
                    <DomainTag>
                      <DomainDot />
                      <DomainTagText>{hoveredProject.domain}</DomainTagText>
                    </DomainTag>
                  )}
                </Box>
              ) : (
                <PlaceholderBox>
                  <PreviewDimLabel>Preview</PreviewDimLabel>
                  <PreviewBody>Hover a project to see its details here.</PreviewBody>
                </PlaceholderBox>
              )}
            </PreviewArea>

            <LeftFooter>BRMS Platform · 2025</LeftFooter>
          </LeftContent>
        </LeftPanel>

        {/* ─── RIGHT PANEL ─── */}
        <RightPanel>
          <RightHeader>
            <Box>
              <HeaderAccentLine />
              <RightTitle>All Projects</RightTitle>
              <RightSubtitle>Select a project to manage its rules</RightSubtitle>
            </Box>
            <NewProjectButton
              variant="contained"
              disableRipple
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject`)}
            >
              + New Project
            </NewProjectButton>
          </RightHeader>

          <ScrollArea>
            {loading ? (
              <CenteredBox>
                <CircularProgress size={28} sx={{ color: colors.panelIndigo }} />
              </CenteredBox>
            ) : paginatedProjects.length === 0 ? (
              <EmptyBox>
                <EmptyIconBox>
                  <FolderOpenIcon sx={{ fontSize: 24, color: colors.lightTextLow }} />
                </EmptyIconBox>
                <EmptyTextCenter>
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptySubtitle>Get started by creating your first project</EmptySubtitle>
                </EmptyTextCenter>
              </EmptyBox>
            ) : (
              <CardsList>
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    onClick={() => handleOpenProject(project)}
                    onMouseEnter={() => setHoveredProject(project)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <CardLeft>
                      <CardDot />
                      <Box>
                        <CardName>{project.name}</CardName>
                        <CardUpdatedRow>
                          <CardUpdatedLabel>Updated</CardUpdatedLabel>
                          <CardUpdatedValue>{project.updatedAt}</CardUpdatedValue>
                        </CardUpdatedRow>
                      </Box>
                    </CardLeft>
                    <CardRight>
                      {project.domain && (
                        <DomainBadge>{project.domain}</DomainBadge>
                      )}
                      <CardMenuButton
                        size="small"
                        disableRipple
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, project);
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: 16 }} />
                      </CardMenuButton>
                    </CardRight>
                  </ProjectCard>
                ))}
              </CardsList>
            )}
          </ScrollArea>

          {totalPages > 1 && (
            <PaginationRow>
              <StyledPagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
              />
            </PaginationRow>
          )}
        </RightPanel>
      </RootWrapper>

      <StyledMenu
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl}
        onClose={handleMenuClose}
      >
        <EditMenuItem onClick={handleEdit}>Edit</EditMenuItem>
        <DeleteMenuItem onClick={handleDelete}>Delete</DeleteMenuItem>
      </StyledMenu>
    </>
  );
}