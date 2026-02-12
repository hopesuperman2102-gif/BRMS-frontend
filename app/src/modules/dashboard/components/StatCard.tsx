import React from "react";
import { Box, Typography } from "@mui/material";
import { TrendingUp, TrendingDown } from "lucide-react";
import { RcCard } from "app/src/core/components/RcCard";
import { brmsTheme } from "app/src/core/theme/brmsTheme";
import { StatCardProps } from "../dashboardTypes";

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  icon,
  gradient,
}) => {
  return (
    <RcCard sx={{ height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: brmsTheme.colors.textSecondary,
              fontWeight: 600,
              letterSpacing: "0.05em",
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: "2.5rem",
              fontWeight: 700,
              background: gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.875rem",
              color: brmsTheme.colors.textSecondary,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 56,
            height: 56,
            background: gradient,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {icon}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1.5,
          background: trendUp
            ? "rgba(46, 125, 50, 0.1)"
            : "rgba(211, 47, 47, 0.1)",
          borderRadius: 2,
        }}
      >
        {trendUp ? (
          <TrendingUp size={16} color={brmsTheme.colors.success} />
        ) : (
          <TrendingDown size={16} color={brmsTheme.colors.error} />
        )}

        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: trendUp
              ? brmsTheme.colors.success
              : brmsTheme.colors.error,
          }}
        >
          {trend}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.75rem",
            color: brmsTheme.colors.textSecondary,
            ml: "auto",
          }}
        >
          vs last month
        </Typography>
      </Box>
    </RcCard>
  );
};

export default StatCard;
