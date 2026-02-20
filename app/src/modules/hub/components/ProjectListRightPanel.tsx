"use client";

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Pagination,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { ProjectListRightPanelProps } from "../types/projectListTypes";
import { brmsTheme } from "app/src/core/theme/brmsTheme";

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */
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
  flex: 1,
  overflow: "auto",
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
  color: colors.lightTextMid,
  fontSize: "0.8125rem",
});

const CardsList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
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
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
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
  display: "flex",
  gap: 4,
});

const CardUpdatedLabel = styled(Typography)({
  color: colors.lightTextLow,
  fontSize: "0.75rem",
  fontFamily: fonts.mono,
});

const CardUpdatedValue = styled(Typography)({
  color: colors.lightTextMid,
  fontSize: "0.75rem",
  fontWeight: 500,
  fontFamily: fonts.mono,
});

const CardRight = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
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
  display: "flex",
  justifyContent: "center",
  marginTop: 20,
  flexShrink: 0,
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
      "&:hover": { background: colors.panelIndigoHover },
    },
    "&:hover": { background: colors.lightSurfaceHover },
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
  "&:hover": { backgroundColor: "#F8FAFC" },
});

const DeleteMenuItem = styled(MenuItem)({
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: colors.deleteRed,
  padding: "10px 16px",
  "&:hover": { backgroundColor: colors.errorBg },
});

/* ─── Component ───────────────────────────────────────────── */
export default function ProjectListRightPanel({
  loading,
  paginatedProjects,
  totalPages,
  page,
  menuAnchorEl,
  onPageChange,
  onOpenProject,
  onMenuOpen,
  onMenuClose,
  onEdit,
  onDelete,
  onNewProject,
  onHoverProject,
}: ProjectListRightPanelProps) {
  return (
    <RightPanel>
      {/* ─── Header ─── */}
      <RightHeader>
        <Box>
          <HeaderAccentLine />
          <RightTitle>All Projects</RightTitle>
          <RightSubtitle>Select a project to manage its rules</RightSubtitle>
        </Box>
        <NewProjectButton variant="contained" onClick={onNewProject}>
          + New Project
        </NewProjectButton>
      </RightHeader>

      {/* ─── List ─── */}
      <ScrollArea>
        {loading ? (
          <CenteredBox>
            <CircularProgress size={28} sx={{ color: colors.panelIndigo }} />
          </CenteredBox>
        ) : paginatedProjects.length === 0 ? (
          <EmptyBox>
            <EmptyIconBox>
              <FolderOpenIcon sx={{ fontSize: 22, color: colors.lightTextLow }} />
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
                key={project.project_key}
                onClick={() => onOpenProject(project)}
                onMouseEnter={() => onHoverProject(project)}
                onMouseLeave={() => onHoverProject(null)}
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
                  {project.domain && <DomainBadge>{project.domain}</DomainBadge>}
                  <CardMenuButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenuOpen(e, project);
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

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <PaginationRow>
          <StyledPagination
            count={totalPages}
            page={page}
            onChange={(_, v) => onPageChange(v)}
          />
        </PaginationRow>
      )}

      {/* ─── Context Menu ─── */}
      <StyledMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={onMenuClose}
      >
        <EditMenuItem onClick={onEdit}>Edit</EditMenuItem>
        <DeleteMenuItem onClick={onDelete}>Delete</DeleteMenuItem>
      </StyledMenu>
    </RightPanel>
  );
}