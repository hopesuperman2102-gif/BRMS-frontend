import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { useState } from "react";
import CdfTable from "./CdfTable";

const DeployTab = () => {
  const [selectedEnv, setSelectedEnv] = useState<"DEV" | "QA" | "PROD">("DEV");

  // Sample data for the table
  const tableHeaders = ["Name", "Status", "Date", "Owner"];
  const tableRows = [
    { Name: "Project Alpha", Status: "Active", Date: "2024-01-15", Owner: "John Doe" },
    { Name: "Project Beta", Status: "Pending", Date: "2024-01-20", Owner: "Jane Smith" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
    { Name: "Project Gamma", Status: "Completed", Date: "2024-01-25", Owner: "Bob Johnson" },
  ];

  return (
    <Box sx={{ p: 3, height: "calc(100vh - 48px)", overflow: "hidden" }}>
      <Grid container spacing={3} sx={{ height: "100%" }}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Left Top Card */}
          <Card sx={{ flex: 1, mb: 3 }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant={selectedEnv === "DEV" ? "contained" : "outlined"}
                  onClick={() => setSelectedEnv("DEV")}
                  sx={{ mr: 1 }}
                >
                  DEV
                </Button>
                <Button
                  variant={selectedEnv === "QA" ? "contained" : "outlined"}
                  onClick={() => setSelectedEnv("QA")}
                  sx={{ mr: 1 }}
                >
                  QA
                </Button>
                <Button
                  variant={selectedEnv === "PROD" ? "contained" : "outlined"}
                  onClick={() => setSelectedEnv("PROD")}
                >
                  PROD
                </Button>
              </Box>
              <Typography variant="h6" gutterBottom>
                Environment: {selectedEnv}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Additional content for the left card goes here.
              </Typography>
            </CardContent>
          </Card>

          {/* Left Bottom Card */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Deploy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Content for the second card.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Card with Table */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: "100%" }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Typography variant="h6" gutterBottom>
                Rules
              </Typography>
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <CdfTable headers={tableHeaders} rows={tableRows} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeployTab;