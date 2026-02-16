'use client';

import React, { useState, useMemo } from "react";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { RcCard } from "app/src/core/components/RcCard";
import { brmsTheme } from "app/src/core/theme/brmsTheme";
import { MonthlyData } from "../api/dashboardApi";

interface Props {
  data: MonthlyData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const getBarColor = (index: number): string => {
  const colors = ["#1976d2", "#2196f3", "#42a5f5"];
  return colors[index % colors.length];
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DeployedRulesChart: React.FC<Props> = ({ data, selectedYear, onYearChange }) => {
  const currentYear = 2026;

  // Generate years from 2026 to 2051 (26 years total)
  const availableYears = useMemo(() => {
    const years = [];
    for (let i = 0; i < 26; i++) {
      years.push(currentYear + i);
    }
    return years;
  }, []);

  // Get unique years that have data
  const yearsWithData = useMemo(() => {
    return [...new Set(data.map(item => item.year))];
  }, [data]);

  // Filter data by selected year and create full 12-month dataset
  const chartData = useMemo(() => {
    const yearData = data.filter(item => item.year === selectedYear);
    
    // Create array with all 12 months
    return monthNames.map((month, index) => {
      const monthNumber = index + 1;
      const dataPoint = yearData.find(item => item.month === monthNumber);
      
      return {
        month: month,
        year: selectedYear,
        value: dataPoint ? dataPoint.total : 0
      };
    });
  }, [data, selectedYear]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <RcCard>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
            Deployed Rules
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", color: brmsTheme.colors.textSecondary }}>
            Cumulative deployment statistics
          </Typography>
        </Box>

        <Select 
          value={selectedYear} 
          onChange={(e) => onYearChange(Number(e.target.value))}
          size="small" 
          sx={{ minWidth: 160 }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: '5cm',
              },
            },
          }}
        >
          {availableYears.map((year) => (
            <MenuItem 
              key={year} 
              value={year}
              disabled={!yearsWithData.includes(year)}
            >
              {year}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ position: "relative", height: 320 }}>

        {/* Y Axis */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: brmsTheme.colors.textSecondary,
            fontWeight: 600,
            width: 35,
          }}
        >
          <div>{maxValue}</div>
          <div>{Math.round(maxValue * 0.8)}</div>
          <div>{Math.round(maxValue * 0.6)}</div>
          <div>{Math.round(maxValue * 0.4)}</div>
          <div>{Math.round(maxValue * 0.2)}</div>
          <div>0</div>
        </Box>

        {/* Bars */}
        <Box
          sx={{
            position: "absolute",
            left: "45px",
            right: 2,
            top: 0,
            bottom: "60px",
            display: "flex",
            alignItems: "flex-end",
            gap: 0.75,
          }}
        >
          {chartData.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;

            return (
              <Box key={index} sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: `${heightPercent}%`,
                    background: getBarColor(index),
                    borderRadius: "6px 6px 0 0",
                    transition: "all 0.3s",
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* X Axis - Month Labels */}
        <Box
          sx={{
            position: "absolute",
            left: "45px",
            right: 2,
            bottom: 0,
            height: "40px",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {chartData.map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: brmsTheme.colors.textSecondary,
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