import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardHeader from "../components/DashboardHeader";
import StatsSection from "../components/Stats";
import { verticalsApi } from '../../vertical/api/verticalsApi';
import { dashboardApi, DashboardSummary } from '../api/dashboardApi';
import RcMonthBarChart from 'app/src/core/components/RcMonthBarChart';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const [verticalName, setVerticalName] = useState<string>('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedRulesCreatedYear, setSelectedRulesCreatedYear] = useState<number>(2026);
  const [selectedDeployedRulesYear, setSelectedDeployedRulesYear] = useState<number>(2026);

  // Fetch Vertical Name
  useEffect(() => {
    if (!vertical_Key) return;

    const fetchVerticalName = async () => {
      try {
        const verticals = await verticalsApi.getVerticalsView();
        const vertical = verticals.find((v) => v.vertical_key === vertical_Key);
        if (vertical) {
          setVerticalName(vertical.vertical_name);
        }
      } catch (error) {
        console.error('Error fetching vertical:', error);
      }
    };

    fetchVerticalName();
  }, [vertical_Key]);

  // 🔥 Fetch Dashboard Summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardApi.getSummary(vertical_Key || '');
        setSummary(data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    fetchSummary();
  }, []);

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
          <IconButton onClick={() => navigate('/vertical')}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(101, 82, 208, 0.08)',
              color: '#6552D0',
              transition: 'all 0.2s',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'rgba(101, 82, 208, 0.15)',
                transform: 'translateX(-2px)',
              },
            }}>
                     
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {verticalName && (
            <Typography 
            sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
            >
              {verticalName}
            </Typography>
          )}
        </Box>

        <DashboardHeader />

        {/* 🔥 Pass API Data */}
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