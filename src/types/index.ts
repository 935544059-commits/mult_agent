export type AgentMode = 'workflow' | 'react';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'WAITING_USER' | 'COMPLETED' | 'FAILED';

export interface APIConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description?: string;
  authType: 'API_KEY' | 'BEARER_TOKEN' | 'NONE';
  authKey?: string;
  requiresConfirmation: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  mode: AgentMode;
  apiConfig?: APIConfig;
  toolkits: APIConfig[];
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReActStep {
  id: string;
  thought: string;
  action: string;
  actionParams?: Record<string, unknown>;
  observation: string;
  timestamp: string;
}

export interface PlannedStep {
  id: string;
  thought: string;
  action: string;
  actionParams?: Record<string, unknown>;
}

export interface TaskStatusResponse {
  taskId: string;
  status: TaskStatus;
  mode: AgentMode;
  steps: ReActStep[];
  plannedSteps?: PlannedStep[];
  isPlanning?: boolean;
  finalAnswer?: string;
  requiresAction?: {
    action: string;
    actionParams: Record<string, unknown>;
    apiConfig: APIConfig;
  };
  error?: string;
}

export interface ChatRequest {
  agentId: string;
  message: string;
  mode?: AgentMode;
}

export interface ChatResponse {
  taskId?: string;
  mode: AgentMode;
  answer?: string;
  error?: string;
  plannedSteps?: PlannedStep[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  taskId?: string;
  mode?: AgentMode;
  steps?: ReActStep[];
  plannedSteps?: PlannedStep[];
  isPlanning?: boolean;
  finalAnswer?: string;
  requiresAction?: TaskStatusResponse['requiresAction'];
  status?: TaskStatus;
  timestamp: string;
}