'use client';
 
import AppBarComponent from '../../../core/components/AppBarComponent';
import ProjectRuleComponent from "../components/ProjectRuleComponent";
 

export default function ProjectRulePage() {

  return (
<>
    <AppBarComponent
      logo={<img src="/logo.svg" height={32} alt="logo" />}
      organizationName="Business Rules Management"
    />
    
    <ProjectRuleComponent/>;
</>

  );

}
 