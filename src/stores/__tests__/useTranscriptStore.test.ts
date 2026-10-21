import { describe, it, expect, beforeEach } from 'vitest';
import { useTranscriptStore } from '../useTranscriptStore';
import { TranscriptSegment } from '@/types/transcript';

const mockSegments: TranscriptSegment[] = [
  {
    id: 'seg-1',
    speakerId: 'spk-1',
    speakerName: 'Danilo Diniz',
    start: 0,
    end: 4.5,
    text: 'Let us align the Q3 engineering priorities.',
    words: [
      { id: 'w-1', word: 'Let', start: 0, end: 0.5, confidence: 0.98 },
      { id: 'w-2', word: 'us', start: 0.5, end: 0.8, confidence: 0.95 },
      { id: 'w-3', word: 'align', start: 0.8, end: 1.5, confidence: 0.99 },
    ],
  },
  {
    id: 'seg-2',
    speakerId: 'spk-2',
    speakerName: 'Sarah Connor',
    start: 4.6,
    end: 8.0,
    text: 'Audio synchronization performance is on track.',
    words: [
      { id: 'w-4', word: 'Audio', start: 4.6, end: 5.2, confidence: 0.99 },
      { id: 'w-5', word: 'synchronization', start: 5.2, end: 6.5, confidence: 0.97 },
    ],
  },
];

describe('useTranscriptStore', () => {
  beforeEach(() => {
    useTranscriptStore.getState().reset();
  });

  it('should initialize with default empty state', () => {
    const state = useTranscriptStore.getState();

    expect(state.segments).toEqual([]);
    expect(state.activeSegmentId).toBeNull();
    expect(state.activeWordId).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.selectedSpeakerIds).toEqual([]);
    expect(state.isAutoScrollEnabled).toBe(true);
  });

  it('should set segments correctly', () => {
    useTranscriptStore.getState().setSegments(mockSegments);
    expect(useTranscriptStore.getState().segments).toHaveLength(2);
  });

  it('should update active segment and word IDs', () => {
    useTranscriptStore.getState().setActiveSync('seg-1', 'w-3');

    const state = useTranscriptStore.getState();
    expect(state.activeSegmentId).toBe('seg-1');
    expect(state.activeWordId).toBe('w-3');
  });

  it('should toggle speaker filters correctly', () => {
    useTranscriptStore.getState().toggleSpeakerFilter('spk-1');
    expect(useTranscriptStore.getState().selectedSpeakerIds).toEqual(['spk-1']);

    useTranscriptStore.getState().toggleSpeakerFilter('spk-2');
    expect(useTranscriptStore.getState().selectedSpeakerIds).toEqual(['spk-1', 'spk-2']);

    useTranscriptStore.getState().toggleSpeakerFilter('spk-1');
    expect(useTranscriptStore.getState().selectedSpeakerIds).toEqual(['spk-2']);
  });

  it('should clear all filters and reset state', () => {
    useTranscriptStore.getState().setSearchQuery('priorities');
    useTranscriptStore.getState().toggleSpeakerFilter('spk-1');

    useTranscriptStore.getState().clearFilters();

    const state = useTranscriptStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.selectedSpeakerIds).toEqual([]);
  });

  it('should toggle auto scroll preference', () => {
    useTranscriptStore.getState().setAutoScrollEnabled(false);
    expect(useTranscriptStore.getState().isAutoScrollEnabled).toBe(false);

    useTranscriptStore.getState().setAutoScrollEnabled(true);
    expect(useTranscriptStore.getState().isAutoScrollEnabled).toBe(true);
  });
});