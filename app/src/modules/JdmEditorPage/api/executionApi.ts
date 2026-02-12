// src/api/executionApi.ts

import { ENV } from '../../../config/env';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import type { JsonObject, JsonValue } from '../../../core/types/commonTypes';

const API_BASE_URL = ENV.API_BASE_URL;

export interface ExecuteRequest {
  jdm: DecisionGraphType;
  input: JsonObject;
}

export interface ExecuteResponse {
  result?: JsonValue;
  error?: string;
  performance?: string;
  trace?: JsonObject;
  status?: 'success' | 'error';
  message?: string;
}

export const executionApi = {
  /**
   * Execute a decision graph with given input context
   * @param jdm - The JDM decision graph
   * @param input - The input context for execution
   * @returns The execution result
   */
  execute: async (jdm: DecisionGraphType, input: JsonObject): Promise<ExecuteResponse> => {
    try {
      if (ENV.ENABLE_LOGGING) {
        console.log('🔄 Executing decision graph:', { jdm, input });
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/execution/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jdm,
          input,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = (await response.json()) as ExecuteResponse;

      if (ENV.ENABLE_LOGGING) {
        console.log('✅ Execution result:', result);
      }

      return result;
    } catch (error) {
      if (ENV.ENABLE_LOGGING) {
        console.error('❌ Error executing decision graph:', error);
      }
      throw error;
    }
  },
};

// Log API endpoint in development
if (ENV.DEBUG_MODE) {
  console.log('📡 Execution API Base URL:', API_BASE_URL);
}