import { extractNormalizedPeaks } from './audioMath';
import { WaveformData } from '@/types/audio';

export async function decodeAudioFile(
  file: File,
  targetPeaksCount: number = 100
): Promise<{ duration: number; waveform: WaveformData; audioUrl: string }> {
  const arrayBuffer = await file.arrayBuffer();

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);

    const peaks = extractNormalizedPeaks(channelData, targetPeaksCount);
    const audioUrl = URL.createObjectURL(file);

    return {
      duration: audioBuffer.duration,
      waveform: {
        peaks,
        samplesPerSecond: Math.round(targetPeaksCount / audioBuffer.duration),
        duration: audioBuffer.duration,
      },
      audioUrl,
    };
  } finally {
    if (audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }
}