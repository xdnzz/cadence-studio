export function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
  
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
  
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
  
    if (hours > 0) {
      const paddedHours = String(hours).padStart(2, '0');
      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
  
    return `${paddedMinutes}:${paddedSeconds}`;
  }
  
  export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
  
  export function extractNormalizedPeaks(
    channelData: Float32Array,
    targetPeaksCount: number
  ): number[] {
    if (channelData.length === 0 || targetPeaksCount <= 0) {
      return [];
    }
  
    const step = Math.floor(channelData.length / targetPeaksCount);
    const blockSize = Math.max(1, step);
    const peaks: number[] = new Array(targetPeaksCount);
  
    let globalMax = 0;
  
    for (let i = 0; i < targetPeaksCount; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);
      let peak = 0;
  
      for (let j = start; j < end; j++) {
        const absoluteValue = Math.abs(channelData[j]);
        if (absoluteValue > peak) {
          peak = absoluteValue;
        }
      }
  
      peaks[i] = peak;
  
      if (peak > globalMax) {
        globalMax = peak;
      }
    }
  
    if (globalMax === 0) {
      return peaks.fill(0);
    }
  
    return peaks.map((p) => Number((p / globalMax).toFixed(4)));
  }
  
  export function calculateTimeFromPosition(
    pixelX: number,
    containerWidth: number,
    duration: number
  ): number {
    if (containerWidth <= 0 || duration <= 0) {
      return 0;
    }
  
    const clampedX = clamp(pixelX, 0, containerWidth);
    const progress = clampedX / containerWidth;
  
    return progress * duration;
  }
  
  export function calculatePositionFromTime(
    currentTime: number,
    duration: number,
    containerWidth: number
  ): number {
    if (duration <= 0 || containerWidth <= 0) {
      return 0;
    }
  
    const clampedTime = clamp(currentTime, 0, duration);
    const ratio = clampedTime / duration;
  
    return ratio * containerWidth;
  }