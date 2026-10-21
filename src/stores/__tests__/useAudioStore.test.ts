import { describe, it, expect, beforeEach } from 'vitest';
import { useAudioStore } from '../useAudioStore';
import { AudioMetadata } from '@/types/audio';

const mockTrack: AudioMetadata = {
  id: 'track-1',
  title: 'Q3 Product Strategy Alignment',
  fileName: 'q3-alignment.mp3',
  duration: 180,
  sampleRate: 44100,
  channels: 2,
  audioUrl: 'https://cdn.example.com/audio/q3-alignment.mp3',
};

describe('useAudioStore', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
  });

  it('initializes with the default state', () => {
    const state = useAudioStore.getState();

    expect(state.status).toBe('idle');
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.playbackRate).toBe(1.0);
    expect(state.volume).toBe(1.0);
    expect(state.isMuted).toBe(false);
    expect(state.activeTrack).toBeNull();
    expect(state.error).toBeNull();
  });

  it('sets the active track and updates the status to loading', () => {
    useAudioStore.getState().setActiveTrack(mockTrack);
    const state = useAudioStore.getState();

    expect(state.activeTrack).toEqual(mockTrack);
    expect(state.status).toBe('loading');
    expect(state.duration).toBe(180);
    expect(state.currentTime).toBe(0);
  });

  it('updates the playback status', () => {
    useAudioStore.getState().setStatus('playing');
    expect(useAudioStore.getState().status).toBe('playing');

    useAudioStore.getState().setStatus('paused');
    expect(useAudioStore.getState().status).toBe('paused');
  });

  it('updates currentTime', () => {
    useAudioStore.getState().setCurrentTime(45.5);
    expect(useAudioStore.getState().currentTime).toBe(45.5);
  });

  it('clamps the volume between 0 and 1', () => {
    useAudioStore.getState().setVolume(1.5);
    expect(useAudioStore.getState().volume).toBe(1.0);

    useAudioStore.getState().setVolume(-0.2);
    expect(useAudioStore.getState().volume).toBe(0.0);
    expect(useAudioStore.getState().isMuted).toBe(true);

    useAudioStore.getState().setVolume(0.7);
    expect(useAudioStore.getState().volume).toBe(0.7);
    expect(useAudioStore.getState().isMuted).toBe(false);
  });

  it('toggles the muted state', () => {
    expect(useAudioStore.getState().isMuted).toBe(false);

    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(true);

    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(false);
  });

  it('sets the playback rate', () => {
    useAudioStore.getState().setPlaybackRate(1.5);
    expect(useAudioStore.getState().playbackRate).toBe(1.5);
  });

  it('records an error and sets the status to error', () => {
    useAudioStore.getState().setError('Failed to decode audio');
    const state = useAudioStore.getState();

    expect(state.error).toBe('Failed to decode audio');
    expect(state.status).toBe('error');
  });

  it('resets the state to the initial values', () => {
    useAudioStore.getState().setActiveTrack(mockTrack);
    useAudioStore.getState().setCurrentTime(90);
    useAudioStore.getState().setStatus('playing');

    useAudioStore.getState().reset();
    const state = useAudioStore.getState();

    expect(state.status).toBe('idle');
    expect(state.currentTime).toBe(0);
    expect(state.activeTrack).toBeNull();
  });
});