"use client";

import AppBarComponent from "../../../core/components/AppBarComponent";
import DashboardComponent from "../components/DashboardComponent";
import PageWrapper from "../../../core/components/PageWrapper";
import { Box } from "@mui/material";

export default function DashboardPage() {
  return (
    <PageWrapper>
      <AppBarComponent
        logo={<img src="/logo.svg" height={32} alt="logo" />}
        organizationName="Business Rules Management"
      />
      <Box flex={1} p={2}>
        <DashboardComponent />
      </Box>
    </PageWrapper>
  );
}
