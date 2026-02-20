'use client';

import dynamic from 'next/dynamic';
import '@gorules/jdm-editor/dist/style.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CustomSimulatorPanel from './Customsimulatorpanel';
import { ExecuteResponse, JdmEditorProps, JsonObject } from 'app/src/modules/JdmEditorPage/types/JdmEditorTypes';

// Client-only imports
const DecisionGraph = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.DecisionGraph),
  { ssr: false }
);

const JdmConfigProvider = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.JdmConfigProvider),
  { ssr: false }
);

interface JdmEditorComponentProps extends JdmEditorProps {
  onSimulatorRun?: (jdm: JdmEditorProps['value'], context: JsonObject) => Promise<ExecuteResponse>;
}

export default function JdmEditorComponent({
  value,
  onChange,
  onSimulatorRun,
}: JdmEditorComponentProps) {
  const handleSimulationRun = async (context: JsonObject): Promise<ExecuteResponse> => {
    console.log('Running simulation with context:', context);
    console.log('Current JDM graph:', value);
    
    if (!onSimulatorRun) {
      console.warn('No onSimulatorRun handler provided');
      return {} as ExecuteResponse;
    }

    try {
      const result = await onSimulatorRun(value, context);
      console.log('Simulation result:', result);
      return result;
    } catch (error) {
      console.error('Error executing simulation:', error);
      throw error;
    }
  };

  const handleSimulationClear = () => {
    // Nothing to clear in DecisionGraph, only local panel state
  };

  return (
    <JdmConfigProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <DecisionGraph
          value={value}
          onChange={onChange}
          panels={[
            {
              id: 'simulator',
              title: 'Simulator',
              icon: <PlayArrowIcon />,
              renderPanel: () => (
                <CustomSimulatorPanel
                  onRun={handleSimulationRun}
                  onClear={handleSimulationClear}
                />
              ),
            },
          ]}
        />
      </div>
    </JdmConfigProvider>
  );
}