const API_BASE_URL = 'http://localhost:8000';

export interface ExecuteRequest {
  jdm: any;
  input: any;
}

export interface ExecuteResponse {
  result?: any;
  error?: string;
  performance?: string;
  trace?: any;
}

export const executionApi = {
  /**
   * Execute a decision graph with given input context
   * @param jdm - The JDM decision graph
   * @param input - The input context for execution
   * @returns The execution result
   */
  execute: async (jdm: any, input: any): Promise<ExecuteResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/execution/execute`, {
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

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error executing decision graph:', error);
      throw error;
    }
  },
};