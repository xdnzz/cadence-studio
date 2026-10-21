import { MeetingIntelligence } from '@/types/intelligence';

const STORAGE_KEY = 'cadence-studio.meeting';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isMeetingIntelligence(value: unknown): value is MeetingIntelligence {
  if (!value || typeof value !== 'object') return false;
  const meeting = value as Partial<MeetingIntelligence>;
  return typeof meeting.overview === 'string' && Array.isArray(meeting.actionItems);
}

export function loadMeeting(): MeetingIntelligence | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isMeetingIntelligence(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMeeting(meeting: MeetingIntelligence) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meeting));
}

export function clearMeeting() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
