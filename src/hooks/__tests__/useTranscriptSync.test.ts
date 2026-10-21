import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranscriptSync, findActiveIndices } from '../useTranscriptSync';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { TranscriptSegment } from '@/types/transcript';

const mockSegments: TranscriptSegment[] = [
  {
    id: 'seg-1',
    speakerId: 'spk-1',
    speakerName: 'Danilo Diniz',
    start: 0,
    end: 4.0,
    text: 'Building high quality software.',
    words: [
      { id: 'w-1', word: 'Building', start: 0, end: 1.0, confidence: 0.99 },
      { id: 'w-2', word: 'high', start: 1.0, end: 2.0, confidence: 0.95 },
      { id: 'w-3', word: 'quality', start: 2.0, end: 3.0, confidence: 0.98 },
      { id: 'w-4', word: 'software.', start: 3.0, end: 4.0, confidence: 0.99 },
    ],
  },
  {
    id: 'seg-2',
    speakerId: 'spk-2',
    speakerName: 'Engineering Lead',
    start: 4.5,
    end: 8.0,
    text: 'Zero regressions in continuous integration.',
    words: [
      { id: 'w-5', word: 'Zero', start: 4.5, end: 5.5, confidence: 0.99 },
      { id: 'w-6', word: 'regressions', start: 5.5, end: 8.0, confidence: 0.94 },
    ],
  },
];

describe('useTranscriptSync', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
    useTranscriptStore.getState().reset();
  });

  describe('findActiveIndices helper', () => {
    it('should locate correct segment and word when within timestamps', () => {
      const match1 = findActiveIndices(mockSegments, 0.5);
      expect(match1.segment?.id).toBe('seg-1');
      expect(match1.word?.id).toBe('w-1');

      const match2 = findActiveIndices(mockSegments, 2.5);
      expect(match2.segment?.id).toBe('seg-1');
      expect(match2.word?.id).toBe('w-3');

      const match3 = findActiveIndices(mockSegments, 6.0);
      expect(match3.segment?.id).toBe('seg-2');
      expect(match3.word?.id).toBe('w-6');
    });

    it('should return null when time is between segments or out of bounds', () => {
      const silence = findActiveIndices(mockSegments, 4.2);
      expect(silence.segment).toBeNull();
      expect(silence.word).toBeNull();

      const outOfBounds = findActiveIndices(mockSegments, 15.0);
      expect(outOfBounds.segment).toBeNull();
      expect(outOfBounds.word).toBeNull();
    });
  });

  describe('hook execution', () => {
    it('should synchronize active segment and word when audio time updates', () => {
      useTranscriptStore.getState().setSegments(mockSegments);

      const { result } = renderHook(() => useTranscriptSync());

      act(() => {
        useAudioStore.getState().setCurrentTime(2.5);
      });

      expect(result.current.activeSegmentId).toBe('seg-1');
      expect(result.current.activeWordId).toBe('w-3');
    });

    it('should filter segments by search query', () => {
      useTranscriptStore.getState().setSegments(mockSegments);

      const { result } = renderHook(() => useTranscriptSync());

      act(() => {
        useTranscriptStore.getState().setSearchQuery('regressions');
      });

      expect(result.current.filteredSegments).toHaveLength(1);
      expect(result.current.filteredSegments[0].id).toBe('seg-2');
    });

    it('should filter segments by speaker id', () => {
      useTranscriptStore.getState().setSegments(mockSegments);

      const { result } = renderHook(() => useTranscriptSync());

      act(() => {
        useTranscriptStore.getState().toggleSpeakerFilter('spk-1');
      });

      expect(result.current.filteredSegments).toHaveLength(1);
      expect(result.current.filteredSegments[0].speakerName).toBe('Danilo Diniz');
    });
  });
});