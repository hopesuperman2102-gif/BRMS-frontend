import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardHeader from "@/modules/dashboard/components/DashboardHeader";
import StatsSection from "@/modules/dashboard/components/Stats";
import RcMonthBarChart from '@/core/components/RcMonthBarChart';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { dashboardApi } from '@/modules/dashboard/api/dashboardApi';
import { DashboardSummary } from '@/modules/dashboard/types/dashboardEnpointsTypes';

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
        background: `linear-gradient(135deg, ${brmsTheme.colors.bgGrayLighter} 0%, ${brmsTheme.colors.bgGrayLighter} 100%)`,
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
                color: brmsTheme.colors.textGray,
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
            barColors={[brmsTheme.colors.primary, brmsTheme.colors.indigoLight, brmsTheme.colors.indigoLightShade]}
          />
          <RcMonthBarChart
            data={summary?.monthly_deployments || []}
            selectedYear={selectedDeployedRulesYear}
            onYearChange={setSelectedDeployedRulesYear}
            title="Deployed Rules"
            subtitle="Cumulative deployment statistics"
            height={320}
            tooltipSuffix="deployments"
            barColors={[brmsTheme.colors.info, brmsTheme.colors.chartBlue2, brmsTheme.colors.chartBlueLight]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
