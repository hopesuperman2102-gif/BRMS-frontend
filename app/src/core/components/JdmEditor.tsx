'use client';

import dynamic from 'next/dynamic';
import '@gorules/jdm-editor/dist/style.css';
import { JdmEditorProps } from '../types/commonTypes';

// Client-only imports
const DecisionGraph = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.DecisionGraph),
  { ssr: false }
);

const JdmConfigProvider = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.JdmConfigProvider),
  { ssr: false }
);

export default function JdmEditor({ value, onChange }: JdmEditorProps) {
  return (
    <JdmConfigProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <DecisionGraph value={value} onChange={onChange} />
      </div>
    </JdmConfigProvider>
  );
}