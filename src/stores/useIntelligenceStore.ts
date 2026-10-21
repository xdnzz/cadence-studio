import { create } from 'zustand';
import {
  MeetingIntelligence,
  ActionItem,
  ActionItemPriority,
  ActionItemStatus,
} from '@/types/intelligence';
import { clearMeeting, saveMeeting } from '@/lib/localMeetingStore';

export interface ActionItemEdits {
  title?: string;
  assignee?: string;
  priority?: ActionItemPriority;
}

interface IntelligenceState {
  intelligence: MeetingIntelligence | null;
  isGenerating: boolean;
  streamedSummary: string;
  error: string | null;
}

interface IntelligenceActions {
  setIntelligence: (data: MeetingIntelligence) => void;
  setStreamedSummary: (summary: string) => void;
  appendStreamedSummary: (chunk: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  toggleActionItemStatus: (actionItemId: string) => void;
  updateActionItem: (actionItemId: string, edits: ActionItemEdits) => void;
  addActionItem: (item: ActionItem) => void;
  removeActionItem: (actionItemId: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type IntelligenceStore = IntelligenceState & IntelligenceActions;

const initialState: IntelligenceState = {
  intelligence: null,
  isGenerating: false,
  streamedSummary: '',
  error: null,
};

export const useIntelligenceStore = create<IntelligenceStore>((set) => ({
  ...initialState,

  setIntelligence: (intelligence) => set({ intelligence, error: null }),

  setStreamedSummary: (streamedSummary) => set({ streamedSummary }),

  appendStreamedSummary: (chunk) =>
    set((state) => ({
      streamedSummary: state.streamedSummary + chunk,
    })),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  toggleActionItemStatus: (actionItemId) =>
    set((state) => {
      if (!state.intelligence) return state;

      const updatedActionItems = state.intelligence.actionItems.map((item) => {
        if (item.id === actionItemId) {
          const nextStatus: ActionItemStatus =
            item.status === 'completed' ? 'pending' : 'completed';
          return { ...item, status: nextStatus };
        }
        return item;
      });

      return {
        intelligence: {
          ...state.intelligence,
          actionItems: updatedActionItems,
        },
      };
    }),

  updateActionItem: (actionItemId, edits) =>
    set((state) => {
      if (!state.intelligence) return state;

      return {
        intelligence: {
          ...state.intelligence,
          actionItems: state.intelligence.actionItems.map((item) => {
            if (item.id !== actionItemId) return item;

            const next = { ...item };
            if (edits.title !== undefined) {
              const title = edits.title.trim();
              if (title) next.title = title;
            }
            if (edits.priority !== undefined) next.priority = edits.priority;
            if (edits.assignee !== undefined) {
              const assignee = edits.assignee.trim();
              next.assignee = assignee || undefined;
            }
            return next;
          }),
        },
      };
    }),

  addActionItem: (item) =>
    set((state) => {
      if (!state.intelligence) {
        return {
          intelligence: {
            overview: '',
            takeaways: [],
            actionItems: [item],
            sentiment: { overall: 'neutral', score: 0 },
          },
        };
      }

      return {
        intelligence: {
          ...state.intelligence,
          actionItems: [item, ...state.intelligence.actionItems],
        },
      };
    }),

  removeActionItem: (actionItemId) =>
    set((state) => {
      if (!state.intelligence) return state;

      return {
        intelligence: {
          ...state.intelligence,
          actionItems: state.intelligence.actionItems.filter((i) => i.id !== actionItemId),
        },
      };
    }),

  setError: (error) => set({ error, isGenerating: false }),

  reset: () => set(initialState),
}));

useIntelligenceStore.subscribe((state, previous) => {
  if (state.intelligence === previous.intelligence) return;
  if (state.intelligence) saveMeeting(state.intelligence);
  else clearMeeting();
});