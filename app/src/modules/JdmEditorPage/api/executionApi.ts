// src/api/executionApi.ts

import { ENV } from '../../../config/env';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import { ExecuteResponse, JsonObject } from '../types/JdmEditorTypes';
import axiosInstance from '../../auth/Axiosinstance';

const API_BASE_URL = ENV.API_BASE_URL;

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
        `${API_BASE_URL}/api/v1/execution/simulate`,
        { jdm, input }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};