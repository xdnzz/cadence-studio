import { beforeEach, describe, expect, it } from 'vitest';
import { clearMeeting, isBundledSampleMeeting, loadMeeting, saveMeeting } from '../localMeetingStore';
import { MeetingIntelligence } from '@/types/intelligence';

const meeting: MeetingIntelligence = {
  overview: 'Saved locally until an account exists.',
  takeaways: [],
  actionItems: [
    {
      id: 'a-1',
      title: 'Keep the edited task',
      priority: 'urgent',
      status: 'pending',
      assignee: 'Danilo Diniz',
    },
  ],
  sentiment: { overall: 'neutral', score: 0 },
};

describe('localMeetingStore', () => {
  beforeEach(() => {
    clearMeeting();
  });

  it('should round-trip a meeting through localStorage', () => {
    expect(loadMeeting()).toBeNull();

    saveMeeting(meeting);

    expect(loadMeeting()).toEqual(meeting);
  });

  it('should recognize the bundled sample meeting', () => {
    expect(
      isBundledSampleMeeting({
        ...meeting,
        overview:
          'Strategic engineering review focused on high-performance audio synchronization, state decoupling in Zustand, and post-meeting automation pipelines.',
      }),
    ).toBe(true);
    expect(isBundledSampleMeeting(meeting)).toBe(false);
  });

  it('should ignore stored values that are not a meeting', () => {
    window.localStorage.setItem('cadence-studio.meeting', '{');
    expect(loadMeeting()).toBeNull();

    window.localStorage.setItem('cadence-studio.meeting', JSON.stringify({ overview: 'missing tasks' }));
    expect(loadMeeting()).toBeNull();
  });
});
