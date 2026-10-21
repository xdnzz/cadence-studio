'use client';

import { useEffect, useMemo } from 'react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { TranscriptSegment, WordTimestamp } from '@/types/transcript';

export function findActiveIndices(
  segments: TranscriptSegment[],
  currentTime: number
): { segment: TranscriptSegment | null; word: WordTimestamp | null } {
  if (segments.length === 0 || currentTime < 0) {
    return { segment: null, word: null };
  }

  const activeSegment = segments.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end
  ) || null;

  if (!activeSegment) {
    return { segment: null, word: null };
  }

  const activeWord = activeSegment.words.find(
    (w) => currentTime >= w.start && currentTime <= w.end
  ) || null;

  return { segment: activeSegment, word: activeWord };
}

export function useTranscriptSync() {
  const currentTime = useAudioStore((state) => state.currentTime);

  const segments = useTranscriptStore((state) => state.segments);
  const activeSegmentId = useTranscriptStore((state) => state.activeSegmentId);
  const activeWordId = useTranscriptStore((state) => state.activeWordId);
  const searchQuery = useTranscriptStore((state) => state.searchQuery);
  const selectedSpeakerIds = useTranscriptStore((state) => state.selectedSpeakerIds);
  const setActiveSync = useTranscriptStore((state) => state.setActiveSync);

  useEffect(() => {
    const { segment, word } = findActiveIndices(segments, currentTime);

    const nextSegmentId = segment?.id ?? null;
    const nextWordId = word?.id ?? null;

    if (nextSegmentId !== activeSegmentId || nextWordId !== activeWordId) {
      setActiveSync(nextSegmentId, nextWordId);
    }
  }, [currentTime, segments, activeSegmentId, activeWordId, setActiveSync]);

  const filteredSegments = useMemo(() => {
    return segments.filter((segment) => {
      const matchesSpeaker =
        selectedSpeakerIds.length === 0 || selectedSpeakerIds.includes(segment.speakerId);

      const matchesSearch =
        searchQuery.trim() === '' ||
        segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        segment.speakerName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpeaker && matchesSearch;
    });
  }, [segments, selectedSpeakerIds, searchQuery]);

  return {
    filteredSegments,
    activeSegmentId,
    activeWordId,
  };
}