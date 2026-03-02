import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardHeader from "../components/DashboardHeader";
import StatsSection from "../components/Stats";
import RcMonthBarChart from 'app/src/core/components/RcMonthBarChart';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { DashboardSummary } from '../types/dashboardTypes';
import { dashboardApi } from '../api/dashboardApi';

const { colors } = brmsTheme;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedRulesCreatedYear, setSelectedRulesCreatedYear] = useState<number>(2026);
  const [selectedDeployedRulesYear, setSelectedDeployedRulesYear] = useState<number>(2026);

  useEffect(() => {
    if (!vertical_Key) return;
    const controller = new AbortController();

    const fetchSummary = async () => {
      try {
        const data = await dashboardApi.getSummary(vertical_Key);
        if (!controller.signal.aborted) {
          setSummary(data);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          console.error('Error fetching dashboard summary:', error);
        }
      }
    };

    fetchSummary();
    return () => controller.abort();
  }, [vertical_Key]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        padding: '15px',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <IconButton
            onClick={() => navigate('/vertical')}
            sx={{
              width: 34, height: 34, borderRadius: '8px',
              background: colors.white,
              border: `1px solid ${colors.lightBorder}`,
              color: colors.lightTextMid,
              transition: 'all 0.15s',
              '&:hover': {
                background: colors.primaryGlowSoft,
                color: colors.primary,
                borderColor: colors.primaryGlowMid,
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {summary?.vertical_name && (
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
            >
              {summary.vertical_name}
            </Typography>
          )}
        </Box>

        <DashboardHeader />

        <StatsSection
          totalActiveProjects={summary?.total_active_projects ?? 0}
          totalRules={summary?.total_rules ?? 0}
          activeRules={summary?.active_rules ?? 0}
          pendingRules={summary?.pending_rules ?? 0}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <RcMonthBarChart
            data={summary?.monthly_rule_creations || []}
            selectedYear={selectedRulesCreatedYear}
            onYearChange={setSelectedRulesCreatedYear}
            title="Rules Created"
            subtitle="Monthly rule creation trends"
            height={320}
            tooltipSuffix="rules"
            barColors={["#6552D0", "#7B6AE0", "#9182F0"]}
          />
          <RcMonthBarChart
            data={summary?.monthly_deployments || []}
            selectedYear={selectedDeployedRulesYear}
            onYearChange={setSelectedDeployedRulesYear}
            title="Deployed Rules"
            subtitle="Cumulative deployment statistics"
            height={320}
            tooltipSuffix="deployments"
            barColors={["#1976d2", "#2196f3", "#42a5f5"]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;