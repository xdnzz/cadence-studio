import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';
import { useAudioStore } from '@/stores/useAudioStore';
import { AudioMetadata } from '@/types/audio';

const mockTrack: AudioMetadata = {
  id: 'track-1',
  title: 'Sprint Planning Meeting',
  fileName: 'planning.mp3',
  duration: 120,
  sampleRate: 44100,
  channels: 2,
  audioUrl: 'https://cdn.example.com/audio/planning.mp3',
};

describe('useAudioEngine', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
    vi.restoreAllMocks();

    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();

    Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
      value: 120,
      writable: true,
      configurable: true,
    });
  });

  it('initializes and toggles play and pause', async () => {
    const { result } = renderHook(() => useAudioEngine());

    act(() => {
      useAudioStore.getState().setActiveTrack(mockTrack);
    });

    await act(async () => {
      await result.current.play();
    });

    expect(useAudioStore.getState().status).toBe('playing');

    act(() => {
      result.current.pause();
    });

    expect(useAudioStore.getState().status).toBe('paused');
  });

  it('seeks to a specific timestamp', () => {
    const { result } = renderHook(() => useAudioEngine());

    act(() => {
      useAudioStore.getState().setActiveTrack(mockTrack);
      useAudioStore.getState().setDuration(120);
    });

    act(() => {
      result.current.seek(45);
    });

    expect(useAudioStore.getState().currentTime).toBe(45);
  });
});