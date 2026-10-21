'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { formatTime } from '@/lib/audioMath';
import { Button } from '@/components/ui/button';

export const AudioPlayerControls: React.FC = () => {
  const { togglePlayPause, seek } = useAudioEngine();

  const status = useAudioStore((state) => state.status);
  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const playbackRate = useAudioStore((state) => state.playbackRate);
  const volume = useAudioStore((state) => state.volume);
  const isMuted = useAudioStore((state) => state.isMuted);

  const setPlaybackRate = useAudioStore((state) => state.setPlaybackRate);
  const setVolume = useAudioStore((state) => state.setVolume);
  const toggleMute = useAudioStore((state) => state.toggleMute);

  const isPlaying = status === 'playing';

  useKeyboardShortcuts({
    onTogglePlay: togglePlayPause,
    onSeekBackward: () => seek(currentTime - 5),
    onSeekForward: () => seek(currentTime + 5),
    onToggleMute: toggleMute,
  });

  const availableRates = [0.75, 1.0, 1.25, 1.5, 2.0];

  const handleRateCycle = () => {
    const currentIndex = availableRates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % availableRates.length;
    setPlaybackRate(availableRates[nextIndex]);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-3 text-ink shadow-xl sm:flex-nowrap sm:p-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" onClick={() => seek(currentTime - 5)} title="Rewind 5 seconds">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button variant="primary" size="icon-lg" onClick={togglePlayPause} title="Play / Pause">
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current sm:h-5 sm:w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={() => seek(currentTime + 5)} title="Forward 5 seconds">
          <RotateCw className="h-4 w-4" />
        </Button>

        <div className="ml-1 flex items-center font-mono text-xs text-muted sm:ml-2">
          <span className="text-soft">{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button variant="secondary" onClick={handleRateCycle} title="Playback speed">
          {playbackRate}x
        </Button>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMute} className="p-1.5" title="Mute (M)">
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(event) => setVolume(parseFloat(event.target.value))}
            className="h-1.5 w-14 cursor-pointer appearance-none rounded-control bg-line-strong accent-brand sm:w-20"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};