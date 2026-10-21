'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FileText, Workflow as WorkflowIcon, Radio, Sparkles, AlignLeft, Upload } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { WaveformCanvas } from '@/components/audio/WaveformCanvas';
import { AudioPlayerControls } from '@/components/audio/AudioPlayerControls';
import { TranscriptViewer } from '@/components/transcript/TranscriptViewer';
import { MeetingIntelligencePanel } from '@/components/intelligence/MeetingIntelligencePanel';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { AudioDropzone } from '@/components/audio/AudioDropzone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AudioMetadata } from '@/types/audio';
import { TranscriptSegment } from '@/types/transcript';
import { MeetingIntelligence } from '@/types/intelligence';

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.68 7.68 0 0 1 8 3.87c.68.003 1.36.092 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const sampleTrack: AudioMetadata = {
  id: 'track-q3-alignment',
  title: 'Q3 Product & Architecture Alignment',
  fileName: 'q3-alignment.mp3',
  duration: 120,
  sampleRate: 44100,
  channels: 2,
  audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
};

const defaultPeaks = [
  0.12, 0.25, 0.45, 0.78, 0.65, 0.32, 0.18, 0.45, 0.89, 0.95,
  0.72, 0.41, 0.28, 0.62, 0.85, 0.68, 0.35, 0.15, 0.38, 0.74,
  0.88, 0.54, 0.31, 0.65, 0.92, 0.84, 0.49, 0.22, 0.41, 0.76,
  0.82, 0.61, 0.39, 0.58, 0.91, 0.77, 0.42, 0.21, 0.36, 0.69,
  0.85, 0.63, 0.37, 0.52, 0.88, 0.79, 0.45, 0.24, 0.48, 0.81,
];

const sampleSegments: TranscriptSegment[] = [
  {
    id: 'seg-1',
    speakerId: 'spk-1',
    speakerName: 'Danilo Diniz',
    start: 0,
    end: 8.5,
    text: 'Let us align our frontend architecture priorities for the next quarter.',
    words: [
      { id: 'w-1', word: 'Let', start: 0, end: 0.8, confidence: 0.99 },
      { id: 'w-2', word: 'us', start: 0.8, end: 1.4, confidence: 0.98 },
      { id: 'w-3', word: 'align', start: 1.4, end: 2.2, confidence: 0.99 },
      { id: 'w-4', word: 'our', start: 2.2, end: 2.8, confidence: 0.97 },
      { id: 'w-5', word: 'frontend', start: 2.8, end: 3.8, confidence: 0.99 },
      { id: 'w-6', word: 'architecture', start: 3.8, end: 5.2, confidence: 0.98 },
      { id: 'w-7', word: 'priorities', start: 5.2, end: 6.5, confidence: 0.99 },
      { id: 'w-8', word: 'for', start: 6.5, end: 7.1, confidence: 0.95 },
      { id: 'w-9', word: 'the', start: 7.1, end: 7.5, confidence: 0.96 },
      { id: 'w-10', word: 'next', start: 7.5, end: 8.0, confidence: 0.98 },
      { id: 'w-11', word: 'quarter.', start: 8.0, end: 8.5, confidence: 0.99 },
    ],
  },
  {
    id: 'seg-2',
    speakerId: 'spk-2',
    speakerName: 'Engineering Lead',
    start: 9.0,
    end: 18.0,
    text: 'The Canvas waveform decoupled renderer is hitting steady 60 frames per second without React reconciliation bottlenecks.',
    words: [
      { id: 'w-12', word: 'The', start: 9.0, end: 9.5, confidence: 0.99 },
      { id: 'w-13', word: 'Canvas', start: 9.5, end: 10.3, confidence: 0.98 },
      { id: 'w-14', word: 'waveform', start: 10.3, end: 11.2, confidence: 0.99 },
      { id: 'w-15', word: 'decoupled', start: 11.2, end: 12.1, confidence: 0.97 },
      { id: 'w-16', word: 'renderer', start: 12.1, end: 13.0, confidence: 0.98 },
      { id: 'w-17', word: 'is', start: 13.0, end: 13.4, confidence: 0.99 },
      { id: 'w-18', word: 'hitting', start: 13.4, end: 14.1, confidence: 0.97 },
      { id: 'w-19', word: 'steady', start: 14.1, end: 14.8, confidence: 0.98 },
      { id: 'w-20', word: '60', start: 14.8, end: 15.4, confidence: 0.99 },
      { id: 'w-21', word: 'frames', start: 15.4, end: 16.0, confidence: 0.98 },
      { id: 'w-22', word: 'per', start: 16.0, end: 16.4, confidence: 0.95 },
      { id: 'w-23', word: 'second.', start: 16.4, end: 18.0, confidence: 0.99 },
    ],
  },
];

const sampleIntelligence: MeetingIntelligence = {
  overview:
    'Strategic engineering review focused on high-performance audio synchronization, state decoupling in Zustand, and post-meeting automation pipelines.',
  takeaways: [
    {
      id: 't-1',
      topic: 'Canvas Decoupling',
      summary: 'HTML5 Canvas with peak normalization yields superior frame consistency.',
      timestamp: 9.5,
    },
    {
      id: 't-2',
      topic: 'Keyboard Ergonomics',
      summary: 'Global listeners ensure accessibility without breaking text inputs.',
      timestamp: 14.8,
    },
  ],
  actionItems: [
    {
      id: 'a-1',
      title: 'Run production build verification on CI pipeline',
      priority: 'urgent',
      status: 'pending',
      originTimestamp: 5.2,
      assignee: 'Danilo Diniz',
    },
    {
      id: 'a-2',
      title: 'Deploy preview environment to Vercel',
      priority: 'high',
      status: 'completed',
      originTimestamp: 16.4,
      assignee: 'DevOps',
    },
  ],
  sentiment: {
    overall: 'positive',
    score: 0.92,
  },
};

export default function CadenceStudioPage() {
  const [activeTab, setActiveTab] = useState<'meeting' | 'workflow'>('meeting');
  const [mobileSubTab, setMobileSubTab] = useState<'transcript' | 'intelligence'>('transcript');
  const tabListRef = useRef<HTMLElement>(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0, ready: false });
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  const [activePeaks, setActivePeaks] = useState<number[]>(defaultPeaks);

  const { seek } = useAudioEngine();

  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const activeTrack = useAudioStore((state) => state.activeTrack);
  const setActiveTrack = useAudioStore((state) => state.setActiveTrack);
  const setDuration = useAudioStore((state) => state.setDuration);

  const setSegments = useTranscriptStore((state) => state.setSegments);
  const setIntelligence = useIntelligenceStore((state) => state.setIntelligence);

  useEffect(() => {
    setActiveTrack(sampleTrack);
    setDuration(120);
    setSegments(sampleSegments);
    setIntelligence(sampleIntelligence);
  }, [setActiveTrack, setDuration, setSegments, setIntelligence]);

  useLayoutEffect(() => {
    const list = tabListRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) return;
      setTabIndicator({ left: active.offsetLeft, width: active.offsetWidth, ready: true });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeTab]);

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
              {activeTrack?.title || 'Q3 Product & Architecture Alignment'}
            </p>
          </div>
        </div>

        <nav
          ref={tabListRef}
          className="relative flex items-center gap-1 rounded-card border border-line bg-surface p-1"
        >
          <span
            aria-hidden
            className={`absolute bottom-1 top-1 rounded-control bg-raised shadow-sm ${
              tabIndicator.ready
                ? 'transition-[left,width] duration-300 ease-out motion-reduce:transition-none'
                : ''
            }`}
            style={{ left: tabIndicator.left, width: tabIndicator.width }}
          />
          <button
            type="button"
            data-active={activeTab === 'meeting'}
            onClick={() => setActiveTab('meeting')}
            className={`relative z-10 flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-semibold transition-colors duration-300 sm:gap-2 sm:px-3 ${
              activeTab === 'meeting' ? 'text-brand-soft' : 'text-muted hover:text-soft'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Meeting & Intelligence</span>
            <span className="sm:hidden">Meeting</span>
          </button>

          <button
            type="button"
            data-active={activeTab === 'workflow'}
            onClick={() => setActiveTab('workflow')}
            className={`relative z-10 flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-semibold transition-colors duration-300 sm:gap-2 sm:px-3 ${
              activeTab === 'workflow' ? 'text-brand-soft' : 'text-muted hover:text-soft'
            }`}
          >
            <WorkflowIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Agentic Canvas</span>
            <span className="sm:hidden">Workflow</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsDropzoneOpen(true)}
            title="Upload a local audio file"
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

      {activeTab === 'meeting' && (
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
      )}

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 p-3 sm:p-6 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
            activeTab === 'meeting'
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-4 opacity-0'
          }`}
          aria-hidden={activeTab !== 'meeting'}
        >
          <div className="hidden lg:grid grid-cols-2 gap-6 h-full">
            <TranscriptViewer />
            <MeetingIntelligencePanel />
          </div>

          <div className="lg:hidden h-full">
            {mobileSubTab === 'transcript' ? <TranscriptViewer /> : <MeetingIntelligencePanel />}
          </div>
        </div>

        <div
          className={`absolute inset-0 p-3 sm:p-6 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
            activeTab === 'workflow'
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-4 opacity-0'
          }`}
          aria-hidden={activeTab !== 'workflow'}
        >
          <WorkflowCanvas />
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