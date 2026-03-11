import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { RcCard } from '@/core/components/RcCard';

const { colors, gradients } = brmsTheme;

const StyledRcCard = styled(RcCard)({
  marginBottom: '24px',
});

const Row = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Title = styled(Typography)({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: colors.textPrimary,
  margin: 0,
});

const Subtitle = styled(Typography)({
  fontSize: '0.875rem',
  color: colors.textSecondary,
  margin: '4px 0 0 0',
});

const HubButton = styled('button')({
  padding: '12px 24px',
  background: 'white',
  border: `2px solid ${gradients.primary}`,
  borderRadius: '8px',
  color: gradients.primaryHover,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const DashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const verticalName = location.state?.verticalName;

  const handleHubClick = () => {
    navigate(`/vertical/${vertical_Key}/dashboard/hub`, {
      state: { verticalName },
    });
  };

  return (
    <StyledRcCard>
      <Row>
        <div>
          <Title>BRMS Dashboard</Title>
          <Subtitle>
            Real-time insights into your business rules performance and health
          </Subtitle>
        </div>
        <HubButton onClick={handleHubClick}>Hub</HubButton>
      </Row>
    </StyledRcCard>
  );
};

export default DashboardHeader;