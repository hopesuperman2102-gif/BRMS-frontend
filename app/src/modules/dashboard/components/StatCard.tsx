import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { RcCard } from "@/core/components/RcCard";
import { brmsTheme } from "@/core/theme/brmsTheme";
import { StatCardProps } from "@/modules/dashboard/types/dashboardTypes";

const { colors } = brmsTheme;

// ─── Styled Components ───────

const FullHeightCard = styled(RcCard)({
  height: "100%",
});

const CardRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "16px",
});

const CardTitle = styled(Typography)({
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: colors.textSecondary,
  fontWeight: 600,
  letterSpacing: "0.05em",
  marginBottom: "8px",
});

const CardValue = styled(Typography, {
  shouldForwardProp: (p) => p !== "gradient",
})<{ gradient: string }>(({ gradient }) => ({
  fontSize: "2.5rem",
  fontWeight: 700,
  background: gradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  lineHeight: 1.2,
  marginBottom: "8px",
}));

const CardSubtitle = styled(Typography)({
  fontSize: "0.875rem",
  color: colors.textSecondary,
  fontWeight: 500,
});

const IconBox = styled(Box, {
  shouldForwardProp: (p) => p !== "gradient",
})<{ gradient: string }>(({ gradient }) => ({
  width: 56,
  height: 56,
  background: gradient,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
}));

// ─── Component ────────────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, gradient }) => {
  return (
    <FullHeightCard>
      <CardRow>
        <Box>
          <CardTitle>{title}</CardTitle>
          <CardValue gradient={gradient}>{value}</CardValue>
          <CardSubtitle>{subtitle}</CardSubtitle>
        </Box>

        <IconBox gradient={gradient}>
          <Icon sx={{ fontSize: 28, color: "#fff" }} />
        </IconBox>
      </CardRow>
    </FullHeightCard>
  );
};

export default StatCard;