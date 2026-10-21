import { TranscriptSegment } from '@/types/transcript';

function endsSentence(text: string) {
  return /[.!?…]["')\]]*$/.test(text.trim());
}

function continuesSentence(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return /^[\p{Ll}]/u.test(trimmed);
}

export function joinBrokenSegments(segments: TranscriptSegment[]) {
  const joined: TranscriptSegment[] = [];

  for (const segment of segments) {
    const previous = joined.at(-1);
    const sameSpeaker = previous?.speakerId === segment.speakerId;
    const brokenBoundary =
      previous != null &&
      (!endsSentence(previous.text) || continuesSentence(segment.text));

    if (!previous || !sameSpeaker || !brokenBoundary) {
      joined.push({ ...segment, words: [...(segment.words ?? [])] });
      continue;
    }

    previous.end = Math.max(previous.end, segment.end);
    previous.text = `${previous.text.trim()} ${segment.text.trim()}`.replace(/\s+/g, ' ');
    previous.words = [...previous.words, ...(segment.words ?? [])];
  }

  return joined.map((segment, index) => ({
    ...segment,
    id: `seg-${index}`,
  }));
}
