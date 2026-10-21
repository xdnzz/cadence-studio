import { AudioMetadata } from '@/types/audio';
import { MeetingIntelligence } from '@/types/intelligence';
import { TranscriptSegment } from '@/types/transcript';

export interface SampleMeeting {
  track: AudioMetadata;
  peaks: number[];
  segments: TranscriptSegment[];
  intelligence: MeetingIntelligence;
}

export const sampleMeeting: SampleMeeting = {
  track: {
    id: 'track-q3-alignment',
    title: 'Q3 Product & Architecture Alignment',
    fileName: 'q3-alignment.mp3',
    duration: 120,
    sampleRate: 44100,
    channels: 2,
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
  },
  peaks: [
    0.12, 0.25, 0.45, 0.78, 0.65, 0.32, 0.18, 0.45, 0.89, 0.95, 0.72, 0.41, 0.28,
    0.62, 0.85, 0.68, 0.35, 0.15, 0.38, 0.74, 0.88, 0.54, 0.31, 0.65, 0.92, 0.84,
    0.49, 0.22, 0.41, 0.76, 0.82, 0.61, 0.39, 0.58, 0.91, 0.77, 0.42, 0.21, 0.36,
    0.69, 0.85, 0.63, 0.37, 0.52, 0.88, 0.79, 0.45, 0.24, 0.48, 0.81,
  ],
  segments: [
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
  ],
  intelligence: {
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
  },
};
