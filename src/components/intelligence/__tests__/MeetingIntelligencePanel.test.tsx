import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingIntelligencePanel } from '../MeetingIntelligencePanel';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { MeetingIntelligence } from '@/types/intelligence';

const mockIntelligence: MeetingIntelligence = {
  overview: 'The team aligned on the engineering milestones.',
  takeaways: [
    {
      id: 't-1',
      topic: 'Canvas Rendering',
      summary: 'Achieved 60fps waveform animation.',
      timestamp: 30,
    },
  ],
  actionItems: [
    {
      id: 'a-1',
      title: 'Deploy to Vercel preview',
      priority: 'urgent',
      status: 'pending',
      originTimestamp: 50,
    },
  ],
  sentiment: {
    overall: 'positive',
    score: 0.9,
  },
};

describe('MeetingIntelligencePanel', () => {
  beforeEach(() => {
    useIntelligenceStore.getState().reset();
    useAudioStore.getState().reset();
    vi.restoreAllMocks();

    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  });

  it('should render executive summary and takeaways correctly', () => {
    useIntelligenceStore.getState().setIntelligence(mockIntelligence);

    render(<MeetingIntelligencePanel />);

    expect(screen.getByText('The team aligned on the engineering milestones.')).toBeInTheDocument();
    expect(screen.getByText('Canvas Rendering')).toBeInTheDocument();
    expect(screen.getByText('Deploy to Vercel preview')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('should toggle action item completion status when clicking checkbox', () => {
    useIntelligenceStore.getState().setIntelligence(mockIntelligence);

    render(<MeetingIntelligencePanel />);

    const toggleBtn = screen.getByTitle('Marcar como concluída');
    fireEvent.click(toggleBtn);

    expect(useIntelligenceStore.getState().intelligence?.actionItems[0].status).toBe('completed');
  });

  it('should render streamed summary and pulsing cursor during generation', () => {
    useIntelligenceStore.getState().setIsGenerating(true);
    useIntelligenceStore.getState().setStreamedSummary('Real-time AI streaming in progress...');

    render(<MeetingIntelligencePanel />);

    expect(screen.getByText(/Real-time AI streaming in progress.../)).toBeInTheDocument();
  });
});