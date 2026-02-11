// src/api/ruleVersionsApi.ts

import axios from 'axios';
import { ENV } from '../config/env';
import type { DecisionGraphType } from '@gorules/jdm-editor';

const BASE_URL = ENV.API_BASE_URL;

export interface RuleVersion {
  version: string;
  checksum: string;
  is_valid: boolean;
  created_by: string;
  created_at: string;
  jdm?: DecisionGraphType;
}

export interface CreateRuleVersionRequest {
  rule_key: string;
  jdm: DecisionGraphType;
}

export interface ListRuleVersionsRequest {
  rule_key: string;
}

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: ENV.IS_PRODUCTION ? 10000 : 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    if (ENV.ENABLE_LOGGING) {
      console.log(`🚀 [${ENV.ENVIRONMENT}] Rule Versions API Request:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    if (ENV.ENABLE_LOGGING) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    if (ENV.ENABLE_LOGGING) {
      console.log(`✅ [${ENV.ENVIRONMENT}] Rule Versions API Response:`, {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (ENV.ENABLE_LOGGING) {
      console.error(`❌ [${ENV.ENVIRONMENT}] Rule Versions API Error:`, {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export const ruleVersionsApi = {

  listVersions: async (rule_key: string): Promise<RuleVersion[]> => {
    try {
      const response = await axiosInstance.get(`/api/v1/rules/${rule_key}/versions`,);
      return response.data;
    } catch (error) {
      console.error('Error fetching rule versions:', error);
      throw error;
    }
  },

  /**
   * Create a new version for a rule
   */
  createVersion: async (data: CreateRuleVersionRequest): Promise<RuleVersion> => {
    try {
      const response = await axiosInstance.post(`/api/v1/rules/${data.rule_key}/versions`, data);
      return response.data as RuleVersion;
    } catch (error) {
      console.error('Error creating rule version:', error);
      throw error;
    }
  },

  
   // Get a specific version's JDM data
   
  getVersionData: async (
    rule_key: string,
    version: string
  ): Promise<{ jdm: DecisionGraphType }> => {
    try {
      const response = await axiosInstance.get(`api/v1/rules/${rule_key}/versions/${version}`,
 
      );
      return response.data as { jdm: DecisionGraphType };
    } catch (error) {
      console.error('Error fetching version data:', error);
      throw error;
    }
  },
};

// Log API endpoint in development
if (ENV.DEBUG_MODE) {
  console.log('📡 Rule Versions API Base URL:', BASE_URL);
}