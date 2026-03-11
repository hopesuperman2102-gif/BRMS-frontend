'use client';

import React, { useState, useMemo } from "react";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { RcCard } from "@/core/components/RcCard";
import { brmsTheme } from "@/core/theme/brmsTheme";
import { Props } from "@/core/types/commonTypes";
import { monthNames } from "../constants/commonConstants";


const DEFAULT_COLORS = [brmsTheme.colors.primary, brmsTheme.colors.indigoLight, brmsTheme.colors.indigoLightShade];

// ─── Styled Components ────────────────────────────────────────────────────────

const ChartHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
});

const ChartTitle = styled(Typography)({
  fontSize: "1.25rem",
  fontWeight: 700,
});

const ChartSubtitle = styled(Typography)({
  fontSize: "0.875rem",
  color: brmsTheme.colors.textSecondary,
});

const StyledSelect = styled(Select)({
  minWidth: 160,
});

const YAxis = styled(Box)({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: "40px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  fontSize: "0.75rem",
  color: brmsTheme.colors.textSecondary,
  fontWeight: 600,
  width: 35,
});

const BarsContainer = styled(Box)({
  position: "absolute",
  left: "45px",
  right: 2,
  top: 0,
  bottom: "40px",
  display: "flex",
  alignItems: "flex-end",
  gap: 6,
});

const BarWrapper = styled(Box)({
  flex: 1,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  height: "100%",
});

const Tooltip = styled(Box, {
  shouldForwardProp: (p) => p !== "heightPercent",
})<{ heightPercent: number }>(({ heightPercent }) => ({
  position: "absolute",
  bottom: `calc(${heightPercent}% + 10px)`,
  left: "50%",
  transform: "translateX(-50%)",
  background: brmsTheme.colors.textPrimary,
  color: "white",
  padding: 12,
  borderRadius: 8,
  fontSize: "0.75rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  zIndex: 10,
  whiteSpace: "nowrap",
}));

const TooltipMonth = styled(Typography)({
  fontWeight: 600,
});

const TooltipValue = styled(Typography)({
  fontWeight: 700,
});

const Bar = styled(Box, {
  shouldForwardProp: (p) => p !== "heightPercent" && p !== "barColor" && p !== "showTooltip",
})<{ heightPercent: number; barColor: string; showTooltip: boolean }>(({ heightPercent, barColor, showTooltip }) => ({
  width: "100%",
  height: `${heightPercent}%`,
  background: barColor,
  borderRadius: "6px 6px 0 0",
  transition: "all 0.3s",
  cursor: showTooltip ? "pointer" : "default",
}));

const XAxis = styled(Box)({
  position: "absolute",
  left: "45px",
  right: 2,
  bottom: 0,
  height: "40px",
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const XAxisLabel = styled(Box)({
  flex: 1,
  textAlign: "center",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: brmsTheme.colors.textSecondary,
});

// ─── Component ────────────────────────────────────────────────────────────────

const RcMonthBarChart: React.FC<Props> = ({
  data,
  selectedYear,
  onYearChange,
  title,
  subtitle,
  height = 320,
  barColors = DEFAULT_COLORS,
  tooltipSuffix = "entries",
  showTooltip = true,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const availableYears = useMemo(() => {
    return [...new Set(data.map(item => item.year))].sort((a, b) => a - b);
  }, [data]);

  const chartData = useMemo(() => {
    const yearData = data.filter(item => item.year === selectedYear);
    return monthNames.map((month, index) => {
      const monthNumber = index + 1;
      const dataPoint = yearData.find(item => item.month === monthNumber);
      return {
        month,
        year: selectedYear,
        value: dataPoint ? dataPoint.total : 0,
      };
    });
  }, [data, selectedYear]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  const getBarColor = (index: number) => barColors[index % barColors.length];

  return (
    <RcCard>
      <ChartHeader>
        <Box>
          <ChartTitle>{title}</ChartTitle>
          <ChartSubtitle>{subtitle}</ChartSubtitle>
        </Box>

        <StyledSelect
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          size="small"
          MenuProps={{ PaperProps: { style: { maxHeight: '5cm' } } }}
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </StyledSelect>
      </ChartHeader>

      <Box sx={{ position: "relative", height }}>

        <YAxis>
          <div>{maxValue}</div>
          <div>{Math.round(maxValue * 0.8)}</div>
          <div>{Math.round(maxValue * 0.6)}</div>
          <div>{Math.round(maxValue * 0.4)}</div>
          <div>{Math.round(maxValue * 0.2)}</div>
          <div>0</div>
        </YAxis>

        <BarsContainer>
          {chartData.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            return (
              <BarWrapper
                key={index}
                onMouseEnter={() => showTooltip && setHoveredBar(index)}
                onMouseLeave={() => showTooltip && setHoveredBar(null)}
              >
                {showTooltip && hoveredBar === index && (
                  <Tooltip heightPercent={heightPercent}>
                    <TooltipMonth>{item.month} {item.year}</TooltipMonth>
                    <TooltipValue>{item.value} {tooltipSuffix}</TooltipValue>
                  </Tooltip>
                )}

                <Bar
                  heightPercent={heightPercent}
                  barColor={getBarColor(index)}
                  showTooltip={showTooltip}
                />
              </BarWrapper>
            );
          })}
        </BarsContainer>

        <XAxis>
          {chartData.map((item, index) => (
            <XAxisLabel key={index}>{item.month}</XAxisLabel>
          ))}
        </XAxis>

      </Box>
    </RcCard>
  );
};

export default RcMonthBarChart;