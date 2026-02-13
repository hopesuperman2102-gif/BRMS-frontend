'use client';

import React, { useState } from "react";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { RcCard } from "app/src/core/components/RcCard";
import { brmsTheme } from "app/src/core/theme/brmsTheme";

const deployedRulesData = [
  { month: "Jan", value: 85 },
  { month: "Feb", value: 95 },
  { month: "Mar", value: 110 },
  { month: "Apr", value: 125 },
  { month: "May", value: 145 },
  { month: "Jun", value: 165 },
  { month: "Jul", value: 180 },
  { month: "Aug", value: 200 },
  { month: "Sep", value: 220 },
  { month: "Oct", value: 235 },
  { month: "Nov", value: 225 },
  { month: "Dec", value: 210 },
];

const getBarColor = (index: number): string => {
  const colors = [
    "#1976d2",
    "#2196f3",
    "#42a5f5",
    "#1976d2",
    "#2196f3",
    "#42a5f5",
    "#1976d2",
    "#2196f3",
    "#42a5f5",
    "#1976d2",
    "#2196f3",
    "#42a5f5",
  ];
  return colors[index % colors.length];
};

const DeployedRulesChart = () => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <RcCard>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: brmsTheme.colors.textPrimary,
              mb: 0.5,
            }}
          >
            Deployed Rules
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: brmsTheme.colors.textSecondary,
            }}
          >
            Cumulative deployment statistics
          </Typography>
        </Box>

        <Select
          defaultValue="12"
          size="small"
          sx={{
            minWidth: 160,
            fontSize: "0.875rem",
          }}
        >
          <MenuItem value="12">Last 12 Months</MenuItem>
          <MenuItem value="6">Last 6 Months</MenuItem>
          <MenuItem value="3">Last 3 Months</MenuItem>
        </Select>
      </Box>

      {/* Chart Container */}
      <Box sx={{ position: "relative", height: 320 }}>
        {/* Y Axis */}
        <Box
          sx={{
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
          }}
        >
          <div>250</div>
          <div>200</div>
          <div>150</div>
          <div>100</div>
          <div>50</div>
          <div>0</div>
        </Box>

        {/* Grid Lines */}
        <Box
          sx={{
            position: "absolute",
            left: "45px",
            right: 2,
            top: 0,
            bottom: "40px",
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${i * 20}%`,
                height: "1px",
                background: "#f0f0f0",
              }}
            />
          ))}
        </Box>

        {/* Bars */}
        <Box
          sx={{
            position: "absolute",
            left: "45px",
            right: 2,
            top: 0,
            bottom: "40px",
            display: "flex",
            alignItems: "flex-end",
            gap: 0.75,
          }}
        >
          {deployedRulesData.map((item, index) => {
            const heightPercent = (item.value / 250) * 100;

            return (
              <Box
                key={index}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
                sx={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: "100%",
                }}
              >
                {hoveredBar === index && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: `calc(${heightPercent}% + 10px)`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: brmsTheme.colors.textPrimary,
                      color: "white",
                      p: 1.5,
                      borderRadius: 2,
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.875rem" }}
                    >
                      {item.month} 2024
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                      {item.value} deployed
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    width: "100%",
                    height: `${heightPercent}%`,
                    minHeight: "2px",
                    background: getBarColor(index),
                    borderRadius: "6px 6px 0 0",
                    transition:
                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: hoveredBar === index ? 1 : 0.85,
                    transform:
                      hoveredBar === index
                        ? "scaleY(1.05)"
                        : "scaleY(1)",
                    transformOrigin: "bottom",
                    boxShadow:
                      hoveredBar === index
                        ? `0 4px 12px ${getBarColor(index)}50`
                        : "none",
                    cursor: "pointer",
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* X Axis */}
        <Box
          sx={{
            position: "absolute",
            left: "45px",
            right: 2,
            bottom: 0,
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {deployedRulesData.map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                textAlign: "center",
                fontSize: "0.7rem",
                color: brmsTheme.colors.textSecondary,
                fontWeight: 600,
              }}
            >
              {item.month}
            </Box>
          ))}
        </Box>
      </Box>
    </RcCard>
  );
};

export default DeployedRulesChart;
