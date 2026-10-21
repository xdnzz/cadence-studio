import { describe, it, expect, beforeEach } from 'vitest';
import { useIntelligenceStore } from '../useIntelligenceStore';
import { MeetingIntelligence, ActionItem } from '@/types/intelligence';
import { loadMeeting } from '@/lib/localMeetingStore';

const mockIntelligence: MeetingIntelligence = {
  overview: 'Discussion on architecture and real-time frontend reliability.',
  takeaways: [
    {
      id: 't-1',
      topic: 'Audio Waveform',
      summary: 'Canvas API downsampling performs significantly better than DOM nodes.',
      timestamp: 45,
    },
  ],
  actionItems: [
    {
      id: 'a-1',
      title: 'Configure GitHub Actions test pipeline',
      priority: 'high',
      status: 'pending',
      originTimestamp: 60,
    },
  ],
  sentiment: {
    overall: 'positive',
    score: 0.85,
  },
};

describe('useIntelligenceStore', () => {
  beforeEach(() => {
    useIntelligenceStore.getState().reset();
  });

  it('should initialize with default empty state', () => {
    const state = useIntelligenceStore.getState();

    expect(state.intelligence).toBeNull();
    expect(state.isGenerating).toBe(false);
    expect(state.streamedSummary).toBe('');
    expect(state.error).toBeNull();
  });

  it('should set full intelligence payload', () => {
    useIntelligenceStore.getState().setIntelligence(mockIntelligence);

    const state = useIntelligenceStore.getState();
    expect(state.intelligence).toEqual(mockIntelligence);
    expect(state.intelligence?.actionItems).toHaveLength(1);
  });

  it('should append streamed summary chunks continuously', () => {
    useIntelligenceStore.getState().appendStreamedSummary('Meeting ');
    useIntelligenceStore.getState().appendStreamedSummary('alignment on ');
    useIntelligenceStore.getState().appendStreamedSummary('architecture.');

    expect(useIntelligenceStore.getState().streamedSummary).toBe('Meeting alignment on architecture.');
  });

  it('should toggle action item status optimistically between completed and pending', () => {
    useIntelligenceStore.getState().setIntelligence(mockIntelligence);

    useIntelligenceStore.getState().toggleActionItemStatus('a-1');
    expect(useIntelligenceStore.getState().intelligence?.actionItems[0].status).toBe('completed');

    useIntelligenceStore.getState().toggleActionItemStatus('a-1');
    expect(useIntelligenceStore.getState().intelligence?.actionItems[0].status).toBe('pending');
  });

  it('should edit an action item priority, description, and area', () => {
    useIntelligenceStore.getState().setIntelligence(mockIntelligence);

    useIntelligenceStore.getState().updateActionItem('a-1', {
      title: '  Verify the production build  ',
      priority: 'urgent',
      assignee: '  Danilo Diniz  ',
    });

    const item = useIntelligenceStore.getState().intelligence?.actionItems[0];
    expect(item?.title).toBe('Verify the production build');
    expect(item?.priority).toBe('urgent');
    expect(item?.assignee).toBe('Danilo Diniz');

    useIntelligenceStore.getState().updateActionItem('a-1', { title: '   ', assignee: '   ' });
    const cleared = useIntelligenceStore.getState().intelligence?.actionItems[0];
    expect(cleared?.title).toBe('Verify the production build');
    expect(cleared?.assignee).toBeUndefined();

    expect(loadMeeting()?.actionItems[0].title).toBe('Verify the production build');
    expect(loadMeeting()?.actionItems[0].assignee).toBeUndefined();
  });

  it('should add and remove action items dynamically', () => {
    useIntelligenceStore.getState().setIntelligence(mockIntelligence);

    const newItem: ActionItem = {
      id: 'a-2',
      title: 'Setup dark mode design tokens',
      priority: 'medium',
      status: 'pending',
    };

    useIntelligenceStore.getState().addActionItem(newItem);
    expect(useIntelligenceStore.getState().intelligence?.actionItems).toHaveLength(2);
    expect(useIntelligenceStore.getState().intelligence?.actionItems[0].id).toBe('a-2');

    useIntelligenceStore.getState().removeActionItem('a-2');
    expect(useIntelligenceStore.getState().intelligence?.actionItems).toHaveLength(1);
    expect(useIntelligenceStore.getState().intelligence?.actionItems[0].id).toBe('a-1');
  });
});