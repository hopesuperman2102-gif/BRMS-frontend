import type { DecisionGraphType } from '@gorules/jdm-editor';
import axiosInstance from '@/api/apiClient';
import { ExecuteResponse , JsonObject} from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';

export const executionApi = {
  /**
   * Execute a decision graph with given input context
   * @param jdm - The JDM decision graph
   * @param input - The input context for execution
   * @returns The execution result
   */
  execute: async (jdm: DecisionGraphType, input: JsonObject): Promise<ExecuteResponse> => {
    try {
      const response = await axiosInstance.post<ExecuteResponse>(
        '/api/v1/execution/simulate',
        { jdm, input }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

