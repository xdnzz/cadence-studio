import { describe, it, expect } from 'vitest';
import {
  formatTime,
  clamp,
  extractNormalizedPeaks,
  calculateTimeFromPosition,
  calculatePositionFromTime,
} from '../audioMath';

describe('audioMath', () => {
  describe('formatTime', () => {
    it('formats minutes and seconds', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(9)).toBe('00:09');
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(599)).toBe('09:59');
    });

    it('includes hours when the duration exceeds 3600 seconds', () => {
      expect(formatTime(3600)).toBe('01:00:00');
      expect(formatTime(3665)).toBe('01:01:05');
      expect(formatTime(7325)).toBe('02:02:05');
    });

    it('handles negative or invalid values', () => {
      expect(formatTime(-10)).toBe('00:00');
      expect(formatTime(NaN)).toBe('00:00');
    });
  });

  describe('clamp', () => {
    it('restricts the value to the minimum and maximum range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('extractNormalizedPeaks', () => {
    it('returns an empty array when the data is empty or the count is 0 or less', () => {
      expect(extractNormalizedPeaks(new Float32Array([]), 100)).toEqual([]);
      expect(extractNormalizedPeaks(new Float32Array([0.5, 0.8]), 0)).toEqual([]);
    });

    it('normalizes peaks so the maximum value is 1.0', () => {
      const audioBuffer = new Float32Array([0.1, -0.2, 0.4, -0.8, 0.2, -0.4]);
      const peaks = extractNormalizedPeaks(audioBuffer, 2);

      expect(peaks).toHaveLength(2);
      expect(peaks[0]).toBe(0.5);
      expect(peaks[1]).toBe(1.0);
    });

    it('returns zeros when the data is silence', () => {
      const silence = new Float32Array([0, 0, 0, 0]);
      const peaks = extractNormalizedPeaks(silence, 2);

      expect(peaks).toEqual([0, 0]);
    });
  });

  describe('calculateTimeFromPosition and calculatePositionFromTime', () => {
    it('calculates proportional time from a pixel position', () => {
      expect(calculateTimeFromPosition(250, 1000, 120)).toBe(30);
      expect(calculateTimeFromPosition(500, 1000, 120)).toBe(60);
      expect(calculateTimeFromPosition(1200, 1000, 120)).toBe(120);
      expect(calculateTimeFromPosition(-50, 1000, 120)).toBe(0);
    });

    it('calculates the pixel position from the current time', () => {
      expect(calculatePositionFromTime(30, 120, 1000)).toBe(250);
      expect(calculatePositionFromTime(60, 120, 1000)).toBe(500);
      expect(calculatePositionFromTime(150, 120, 1000)).toBe(1000);
      expect(calculatePositionFromTime(-10, 120, 1000)).toBe(0);
    });
  });
});