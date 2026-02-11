'use client';

import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Card, 
  Grid, 
  Typography, 
  ToggleButton, 
  ToggleButtonGroup,
  Divider,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CdfTable from "./CdfTable";

// Styled Components for that "Aesthetic" look
const GlassCard = styled(Card)(() => ({
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: "#f0f2f5",
  padding: "4px",
  borderRadius: "12px",
  "& .MuiToggleButton-root": {
    border: "none",
    borderRadius: "8px",
    margin: "0 4px",
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
    "&.Mui-selected": {
      backgroundColor: "#fff",
      color: theme.palette.primary.main,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      "&:hover": {
        backgroundColor: "#fff",
      },
    },
  },
}));

const DeployTab = () => {
  const [selectedEnv, setSelectedEnv] = useState<"DEV" | "QA" | "PROD">("DEV");

  const tableHeaders = ["Name", "Status", "Date", "Owner"];
  const tableRows = [
    { Name: "Project Alpha", Status: "Active", Date: "2024-01-15", Owner: "John Doe" },
    { Name: "Project Beta", Status: "Pending", Date: "2024-01-20", Owner: "Jane Smith" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    // ... rest of your rows
  ];

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      overflow: "hidden" 
    }}>
      <Grid container spacing={4} sx={{ height: "calc(100vh - 120px)" }}>
        
        {/* Left Column */}
        <Grid size= {{ xs: 12, md: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          
          <GlassCard sx={{ flex: '0 1 auto', p: 3 }}>
            <Typography variant="overline" color="text.secondary" fontWeight="700">
              Deployment Environment
            </Typography>
            <Box sx={{ mt: 2, mb: 3 }}>
              <StyledToggleButtonGroup
                value={selectedEnv}
                exclusive
                onChange={(_, val) => val && setSelectedEnv(val)}
                fullWidth
              >
                <ToggleButton value="DEV">DEV</ToggleButton>
                <ToggleButton value="QA">QA</ToggleButton>
                <ToggleButton value="PROD">PROD</ToggleButton>
              </StyledToggleButtonGroup>
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1a2027" }}>
              {selectedEnv} Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Configure and monitor your instance parameters for the current release cycle.
            </Typography>
          </GlassCard>

          <GlassCard sx={{ flex: 1, p: 3, background: "linear-gradient(135deg, #6552D0 0%, #17203D 100%)" }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
              Quick Action
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 4 }}>
              Push the latest build to the {selectedEnv} environment instantly.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ 
                bgcolor: "#fff", 
                color: "#6552D0", 
                fontWeight: 700,
                borderRadius: "10px",
                py: 1.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
              }}
            >
              Deploy Now
            </Button>
          </GlassCard>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Deployments
              </Typography>
              <Chip label="Live Updates" color="success" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <Divider sx={{ opacity: 0.6 }} />
            <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
              <CdfTable headers={tableHeaders} rows={tableRows} />
            </Box>
          </GlassCard>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DeployTab;