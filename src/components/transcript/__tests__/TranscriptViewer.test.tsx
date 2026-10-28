import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TranscriptViewer } from '../TranscriptViewer';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { TranscriptSegment } from '@/types/transcript';

const mockSegments: TranscriptSegment[] = [
  {
    id: 'seg-1',
    speakerId: 'spk-1',
    speakerName: 'Danilo Diniz',
    start: 0,
    end: 5.0,
    text: 'Architecting scalable applications.',
    words: [
      { id: 'w-1', word: 'Architecting', start: 0, end: 1.5, confidence: 0.99 },
      { id: 'w-2', word: 'scalable', start: 1.5, end: 3.0, confidence: 0.98 },
      { id: 'w-3', word: 'applications.', start: 3.0, end: 5.0, confidence: 0.97 },
    ],
  },
];

describe('TranscriptViewer', () => {
  beforeEach(() => {
    useTranscriptStore.getState().reset();
    useAudioStore.getState().reset();
    vi.restoreAllMocks();

    Element.prototype.scrollIntoView = vi.fn();
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  });

  it('should ask for a recording when there is no transcript', () => {
    render(<TranscriptViewer />);

    expect(screen.getByText('Upload a recording to transcribe the meeting.')).toBeInTheDocument();
  });

  it('should render speaker names and all words', () => {
    useTranscriptStore.getState().setSegments(mockSegments);

    render(<TranscriptViewer />);

    expect(screen.getByText('Danilo Diniz')).toBeInTheDocument();
    expect(screen.getByText('Architecting')).toBeInTheDocument();
    expect(screen.getByText('scalable')).toBeInTheDocument();
    expect(screen.getByText('applications.')).toBeInTheDocument();
  });

  it('should filter words when typing in search input', () => {
    useTranscriptStore.getState().setSegments(mockSegments);

    render(<TranscriptViewer />);

    const searchInput = screen.getByPlaceholderText('Search by term or participant...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No transcript segments match this search.')).toBeInTheDocument();
  });

  it('should toggle auto scroll when auto scroll button is clicked', () => {
    render(<TranscriptViewer />);

    const autoScrollBtn = screen.getByRole('button', { name: /auto-scroll/i });
    expect(useTranscriptStore.getState().isAutoScrollEnabled).toBe(true);

    fireEvent.click(autoScrollBtn);
    expect(useTranscriptStore.getState().isAutoScrollEnabled).toBe(false);

    fireEvent.click(autoScrollBtn);
    expect(useTranscriptStore.getState().isAutoScrollEnabled).toBe(true);
  });
});