import { DecisionGraphType } from "@gorules/jdm-editor";


export interface JdmRuleVersion {
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

// API request/response types for execution
export interface ExecuteRequest {
  jdm: DecisionGraphType;
  input: JsonObject;
}

export interface ExecuteResponse {
  result?: JsonValue;
  error?: string;
  performance?: string;
  trace?: JsonObject;
  nodeData?: JsonObject;
  status?: 'success' | 'error' | 'SUCCESS' | 'ERROR';
  message?: string;
}
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}
