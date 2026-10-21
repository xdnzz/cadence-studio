import { create } from 'zustand';
import { TranscriptSegment } from '@/types/transcript';

interface TranscriptState {
  segments: TranscriptSegment[];
  activeSegmentId: string | null;
  activeWordId: string | null;
  searchQuery: string;
  selectedSpeakerIds: string[];
  isAutoScrollEnabled: boolean;
}

interface TranscriptActions {
  setSegments: (segments: TranscriptSegment[]) => void;
  setActiveSync: (segmentId: string | null, wordId: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleSpeakerFilter: (speakerId: string) => void;
  clearFilters: () => void;
  setAutoScrollEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export type TranscriptStore = TranscriptState & TranscriptActions;

const initialState: TranscriptState = {
  segments: [],
  activeSegmentId: null,
  activeWordId: null,
  searchQuery: '',
  selectedSpeakerIds: [],
  isAutoScrollEnabled: true,
};

export const useTranscriptStore = create<TranscriptStore>((set) => ({
  ...initialState,

  setSegments: (segments) => set({ segments }),

  setActiveSync: (activeSegmentId, activeWordId) => set({ activeSegmentId, activeWordId }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleSpeakerFilter: (speakerId) =>
    set((state) => {
      const exists = state.selectedSpeakerIds.includes(speakerId);
      return {
        selectedSpeakerIds: exists
          ? state.selectedSpeakerIds.filter((id) => id !== speakerId)
          : [...state.selectedSpeakerIds, speakerId],
      };
    }),

  clearFilters: () => set({ searchQuery: '', selectedSpeakerIds: [] }),

  setAutoScrollEnabled: (isAutoScrollEnabled) => set({ isAutoScrollEnabled }),

  reset: () => set(initialState),
}));