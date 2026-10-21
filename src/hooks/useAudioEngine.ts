'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '@/stores/useAudioStore';

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = useAudioStore((state) => state.activeTrack);
  const status = useAudioStore((state) => state.status);
  const playbackRate = useAudioStore((state) => state.playbackRate);
  const volume = useAudioStore((state) => state.volume);
  const isMuted = useAudioStore((state) => state.isMuted);

  const setStatus = useAudioStore((state) => state.setStatus);
  const setCurrentTime = useAudioStore((state) => state.setCurrentTime);
  const setDuration = useAudioStore((state) => state.setDuration);
  const setError = useAudioStore((state) => state.setError);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setStatus('paused');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setStatus('paused');
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Failed to play the audio file');
    };

    const handleWaiting = () => {
      setStatus('loading');
    };

    const handleCanPlay = () => {
      if (useAudioStore.getState().status === 'loading') {
        setStatus('paused');
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [setDuration, setStatus, setCurrentTime, setError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack?.audioUrl) {
      audio.src = activeTrack.audioUrl;
      audio.load();
    } else {
      audio.src = '';
    }
  }, [activeTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    try {
      setStatus('playing');
      await audio.play();
    } catch {
      setStatus('paused');
      setError('Could not start playback');
    }
  }, [setStatus, setError]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setStatus('paused');
  }, [setStatus]);

  const togglePlayPause = useCallback(() => {
    if (status === 'playing') {
      pause();
    } else {
      play();
    }
  }, [status, play, pause]);

  const seek = useCallback(
    (timeInSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const storeDuration = useAudioStore.getState().duration;
      const validDuration = !isNaN(audio.duration) && audio.duration > 0 ? audio.duration : storeDuration;
      const clampedTime = validDuration > 0
        ? Math.max(0, Math.min(timeInSeconds, validDuration))
        : Math.max(0, timeInSeconds);

      audio.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    },
    [setCurrentTime]
  );

  return {
    play,
    pause,
    togglePlayPause,
    seek,
  };
}