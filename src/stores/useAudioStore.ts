import { create } from 'zustand';
import { AudioMetadata, PlaybackStatus } from '@/types/audio';

interface AudioStoreState {
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  activeTrack: AudioMetadata | null;
  error: string | null;
}

interface AudioStoreActions {
  setStatus: (status: PlaybackStatus) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setActiveTrack: (track: AudioMetadata | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type AudioStore = AudioStoreState & AudioStoreActions;

const initialState: AudioStoreState = {
  status: 'idle',
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  volume: 1.0,
  isMuted: false,
  activeTrack: null,
  error: null,
};

export const useAudioStore = create<AudioStore>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  setCurrentTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  setVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  },

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  setActiveTrack: (activeTrack) =>
    set({
      activeTrack,
      status: activeTrack ? 'loading' : 'idle',
      currentTime: 0,
      duration: activeTrack?.duration ?? 0,
      error: null,
    }),

  setError: (error) => set({ error, status: 'error' }),

  reset: () => set(initialState),
}));