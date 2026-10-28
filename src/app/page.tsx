'use client';

import { useEffect, useState } from 'react';
import { Radio, Sparkles, AlignLeft, Upload } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { WaveformCanvas } from '@/components/audio/WaveformCanvas';
import { AudioPlayerControls } from '@/components/audio/AudioPlayerControls';
import { TranscriptViewer } from '@/components/transcript/TranscriptViewer';
import { MeetingIntelligencePanel } from '@/components/intelligence/MeetingIntelligencePanel';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { clearMeeting, isBundledSampleMeeting, loadMeeting } from '@/lib/localMeetingStore';

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.68 7.68 0 0 1 8 3.87c.68.003 1.36.092 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function CadenceStudioPage() {
  const [mobileSubTab, setMobileSubTab] = useState<'transcript' | 'intelligence'>('transcript');
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  const [activePeaks, setActivePeaks] = useState<number[]>([]);

  const { seek } = useAudioEngine();

  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const activeTrack = useAudioStore((state) => state.activeTrack);

  const setIntelligence = useIntelligenceStore((state) => state.setIntelligence);

  useEffect(() => {
    const audio = useAudioStore.getState();
    const intelligence = useIntelligenceStore.getState().intelligence;
    const saved = loadMeeting();
    const sampleIntelligence =
      (intelligence !== null && isBundledSampleMeeting(intelligence)) ||
      (saved !== null && isBundledSampleMeeting(saved));
    const sampleTrack = audio.activeTrack?.id === 'track-q3-alignment';

    if (sampleIntelligence || sampleTrack) {
      audio.reset();
      useTranscriptStore.getState().reset();
      useIntelligenceStore.getState().reset();
      clearMeeting();
      return;
    }

    if (saved) setIntelligence(saved);
  }, [setIntelligence]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas font-sans text-ink">
      <header className="z-20 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-2.5 backdrop-blur sm:px-6 sm:py-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-control bg-brand text-on-brand shadow-md shadow-brand/20 sm:h-8 sm:w-8">
            <Radio className="h-3.5 w-3.5 animate-pulse sm:h-4 sm:w-4" />
          </div>
          <div>
            <h1 className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-ink-strong sm:gap-2 sm:text-sm">
              Cadence Studio
              <Badge>v0.1.0</Badge>
            </h1>
            <p className="hidden max-w-[200px] truncate text-[11px] text-muted sm:block md:max-w-none">
              {activeTrack?.title ?? 'No recording loaded'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsDropzoneOpen(true)}
            title="Upload an audio file or a video"
          >
            <Upload className="h-3.5 w-3.5 text-brand-soft" />
            <span className="hidden sm:inline">Upload Audio</span>
          </Button>

          <a
            href="https://github.com/xdnzz/cadence-studio"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink-strong"
          >
            <GitHubMark className="h-4 w-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </header>

      <div className="flex items-center justify-center border-b border-line/80 bg-surface/60 p-2 lg:hidden">
          <div className="flex items-center gap-1 rounded-control border border-line bg-canvas p-0.5">
            <Button
              variant={mobileSubTab === 'transcript' ? 'primary' : 'ghost'}
              onClick={() => setMobileSubTab('transcript')}
              className="rounded-md px-3 py-1"
            >
              <AlignLeft className="h-3 w-3" />
              <span>Transcript</span>
            </Button>

            <Button
              variant={mobileSubTab === 'intelligence' ? 'primary' : 'ghost'}
              onClick={() => setMobileSubTab('intelligence')}
              className="rounded-md px-3 py-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Intelligence</span>
            </Button>
          </div>
        </div>

      <main className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-6">
        <div className="hidden h-full lg:grid lg:grid-cols-2 lg:gap-6">
          <TranscriptViewer />
          <MeetingIntelligencePanel />
        </div>

        <div className="h-full lg:hidden">
          {mobileSubTab === 'transcript' ? <TranscriptViewer /> : <MeetingIntelligencePanel />}
        </div>
      </main>

      <footer className="z-20 space-y-2.5 border-t border-line bg-canvas p-3 sm:space-y-3 sm:p-4">
        <WaveformCanvas
          peaks={activePeaks}
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          height={40}
        />
        <AudioPlayerControls />
      </footer>

      <AudioDropzone
        isOpen={isDropzoneOpen}
        onClose={() => setIsDropzoneOpen(false)}
        onAudioDecoded={(newPeaks) => setActivePeaks(newPeaks)}
      />
    </div>
  );
}