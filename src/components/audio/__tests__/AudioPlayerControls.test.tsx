import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayerControls } from '../AudioPlayerControls';
import { useAudioStore } from '@/stores/useAudioStore';

describe('AudioPlayerControls', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
    vi.restoreAllMocks();

    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it('renders the formatted times and the initial play button', () => {
    useAudioStore.getState().setDuration(120);
    useAudioStore.getState().setCurrentTime(30);

    render(<AudioPlayerControls />);

    expect(screen.getByText('00:30')).toBeInTheDocument();
    expect(screen.getByText('02:00')).toBeInTheDocument();
  });

  it('cycles the playback rate when the rate button is clicked', () => {
    render(<AudioPlayerControls />);

    const rateButton = screen.getByText('1x');
    fireEvent.click(rateButton);

    expect(useAudioStore.getState().playbackRate).toBe(1.25);
  });

  it('toggles mute when the volume icon is clicked', () => {
    render(<AudioPlayerControls />);

    const muteButton = screen.getByTitle('Mute (M)');
    fireEvent.click(muteButton);

    expect(useAudioStore.getState().isMuted).toBe(true);
  });
});