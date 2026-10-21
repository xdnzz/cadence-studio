'use client';

import { useEffect } from 'react';
import { sampleMeeting } from '@/fixtures/sampleMeeting';
import { useAudioStore } from '@/stores/useAudioStore';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useTranscriptStore } from '@/stores/useTranscriptStore';

export function useSampleMeeting() {
  const setActiveTrack = useAudioStore((state) => state.setActiveTrack);
  const setDuration = useAudioStore((state) => state.setDuration);
  const title = useAudioStore((state) => state.activeTrack?.title);
  const setSegments = useTranscriptStore((state) => state.setSegments);
  const setIntelligence = useIntelligenceStore((state) => state.setIntelligence);

  useEffect(() => {
    setActiveTrack(sampleMeeting.track);
    setDuration(sampleMeeting.track.duration);
    setSegments(sampleMeeting.segments);
    setIntelligence(sampleMeeting.intelligence);
  }, [setActiveTrack, setDuration, setSegments, setIntelligence]);

  return {
    peaks: sampleMeeting.peaks,
    title: title ?? sampleMeeting.track.title,
  };
}
