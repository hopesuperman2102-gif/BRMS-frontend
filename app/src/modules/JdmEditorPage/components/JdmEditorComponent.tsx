'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import '@gorules/jdm-editor/dist/style.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { JdmEditorComponentProps } from '@/modules/JdmEditorPage/types/JdmEditorTypes';
import { ExecuteResponse, JsonObject } from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';
import type { DecisionGraphType, Simulation } from '@gorules/jdm-editor';

// Client-only imports
const DecisionGraph = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.DecisionGraph),
  { ssr: false }
);

const JdmConfigProvider = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.JdmConfigProvider),
  { ssr: false }
);

const GraphSimulator = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.GraphSimulator),
  { ssr: false }
);

export default function JdmEditorComponent({
  value,
  onChange,
  onSimulatorRun,
  isReviewer = false,
}: JdmEditorComponentProps) {
  const [simulation, setSimulation] = useState<Simulation | undefined>(undefined);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulationRun = async (jdm: DecisionGraphType, context: JsonObject): Promise<ExecuteResponse> => {
    if (!onSimulatorRun) {
      return {} as ExecuteResponse;
    }

    try {
      const result = await onSimulatorRun(jdm, context);
      return result;
    } catch (error) {
      console.error('Error executing simulation:', error);
      throw error;
    }
  };

  const handleSimulationClear = () => {
    setSimulation(undefined);
  };

  return (
    <JdmConfigProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <DecisionGraph
          value={value}
          onChange={isReviewer ? () => {} : onChange}
          disabled={isReviewer}
          simulate={simulation}
          panels={[
            {
              id: 'simulator',
              title: 'Simulator',
              icon: <PlayArrowIcon />,
              renderPanel: () => (
                <GraphSimulator
                  loading={isSimulating}
                  onClear={handleSimulationClear}
                  onRun={async ({ graph, context }) => {
                    try {
                      setIsSimulating(true);
                      const safeContext =
                        context && typeof context === 'object' && !Array.isArray(context)
                          ? (context as JsonObject)
                          : ({} as JsonObject);

                      const apiResult = await handleSimulationRun(graph, safeContext);
                      const status = (apiResult.status ?? '').toLowerCase();
                      if (status === 'error' || apiResult.error) {
                        setSimulation({
                          error: {
                            title: 'Simulation failed',
                            message: apiResult.message || apiResult.error || 'Simulation failed',
                            data: {},
                          },
                        });
                        return;
                      }

                      const tracePayload =
                        (apiResult.trace ?? (apiResult as ExecuteResponse & { nodeData?: unknown }).nodeData ?? {}) as never;

                      setSimulation({
                        result: {
                          performance: apiResult.performance ?? '',
                          result: (apiResult.result ?? {}) as never,
                          trace: tracePayload,
                          snapshot: graph,
                        },
                      });
                    } catch (error) {
                      setSimulation({
                        error: {
                          title: 'Simulation failed',
                          message: (error as Error).message || 'Simulation failed',
                          data: {},
                        },
                      });
                    } finally {
                      setIsSimulating(false);
                    }
                  }}
                />
              ),
            },
          ]}
        />
      </div>
    </JdmConfigProvider>
  );
}
