export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  originTimestamp?: number;
}

export interface KeyTakeaway {
  id: string;
  topic: string;
  summary: string;
  timestamp: number;
}

export interface MeetingIntelligence {
  overview: string;
  takeaways: KeyTakeaway[];
  actionItems: ActionItem[];
  sentiment: {
    overall: 'positive' | 'neutral' | 'challenging';
    score: number;
  };
}