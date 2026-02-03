'use client';
 
import AppBarComponent from '../../../core/components/AppBarComponent';
import ProjectRuleComponent from "../components/ProjectRuleComponent";
import PageWrapper from '../../../core/components/PageWrapper';
import { Box } from '@mui/material';
 

export default function ProjectRulePage() {
  return (
    <PageWrapper>
      {/* ---------- App Bar ---------- */}
      <AppBarComponent
      logo={<img src="/logo.svg" height={32} alt="logo" />}
      organizationName="Business Rules Management"
    /><Box flex={1} p={2}>
        <ProjectRuleComponent />
      </Box>
    </PageWrapper>
  );
}
