export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface AudioMetadata {
  id: string;
  title: string;
  fileName: string;
  duration: number;
  sampleRate: number;
  channels: number;
  audioUrl: string;
}

export interface WaveformData {
  peaks: Float32Array | number[];
  samplesPerSecond: number;
  duration: number;
}

export interface AudioPlaybackState {
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  loop: boolean;
  error: string | null;
}