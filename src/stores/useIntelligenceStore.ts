import { create } from 'zustand';
import { MeetingIntelligence, ActionItem, ActionItemStatus } from '@/types/intelligence';

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