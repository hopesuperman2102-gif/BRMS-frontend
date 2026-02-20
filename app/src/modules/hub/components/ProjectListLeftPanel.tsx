"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountTree from "@mui/icons-material/AccountTree";
import { ProjectListLeftPanelProps } from "../types/projectListTypes";
import { brmsTheme } from "app/src/core/theme/brmsTheme";

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */
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

const LeftContent = styled(Box)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const LeftTitleRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 16,
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
  fontSize: "0.875rem",
  fontWeight: 700,
  color: colors.textOnPrimary,
  fontFamily: fonts.mono,
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
  fontSize: "0.8125rem",
  color: colors.panelTextMid,
  lineHeight: 1.75,
});

const DomainTag = styled(Box)({
  marginTop: 16,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

const DomainDot = styled(Box)({
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: colors.panelIndigo,
  opacity: 0.6,
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

/* ─── Component ───────────────────────────────────────────── */
export default function ProjectListLeftPanel({
  projects,
  hoveredProject,
}: ProjectListLeftPanelProps) {
  return (
    <LeftPanel>
      <LeftVignette />
      <LeftDotGrid />
      <LeftContent>
        <LeftTitleRow>
          <ProjectsIconBox>
            <AccountTree sx={{ fontSize: 18, color: colors.textOnPrimary, opacity: 0.85 }} />
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
            <>
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
            </>
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
  );
}