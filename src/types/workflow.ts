export type WorkflowNodeType = 
  | 'trigger_meeting_end'
  | 'ai_extract'
  | 'send_email'
  | 'create_linear_task'
  | 'slack_notification';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    status: 'idle' | 'running' | 'success' | 'failed';
    config: Record<string, unknown>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}