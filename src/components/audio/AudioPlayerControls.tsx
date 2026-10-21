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
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl">
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => seek(currentTime - 5)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Rewind 5 seconds"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePlayPause}
          className="p-2.5 sm:p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-transform active:scale-95"
          title="Play / Pause"
        >
          {isPlaying ? <Pause className="w-4 sm:w-5 h-4 sm:h-5 fill-current" /> : <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-current ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => seek(currentTime + 5)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Forward 5 seconds"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="flex items-center text-xs font-mono text-slate-400 ml-1 sm:ml-2">
          <span className="text-slate-200">{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button
          type="button"
          onClick={handleRateCycle}
          className="px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Mute (M)"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-14 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};