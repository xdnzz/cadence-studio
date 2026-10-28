import { describe, expect, it } from 'vitest';
import { isAudioFile, isVideoFile, videoNeedsServerExtract } from '../extractAudioFromVideo';

function file(name: string, type: string) {
  return new File(['recording'], name, { type });
}

describe('recording file kinds', () => {
  it('treats audio types and extensions as audio', () => {
    expect(isAudioFile(file('meeting.mp3', 'audio/mpeg'))).toBe(true);
    expect(isAudioFile(file('meeting.wav', ''))).toBe(true);
    expect(isAudioFile(file('meeting.m4a', 'audio/mp4'))).toBe(true);
  });

  it('treats video types and extensions as video', () => {
    expect(isVideoFile(file('meeting.mp4', 'video/mp4'))).toBe(true);
    expect(isVideoFile(file('meeting.mov', ''))).toBe(true);
    expect(isVideoFile(file('meeting.webm', 'video/webm'))).toBe(true);
    expect(isAudioFile(file('meeting.mp4', 'video/mp4'))).toBe(false);
  });

  it('sends videos larger than 80 MB to the server', () => {
    expect(videoNeedsServerExtract(80 * 1024 * 1024)).toBe(false);
    expect(videoNeedsServerExtract(80 * 1024 * 1024 + 1)).toBe(true);
  });

  it('rejects files that are neither audio nor video', () => {
    expect(isAudioFile(file('notes.txt', 'text/plain'))).toBe(false);
    expect(isVideoFile(file('notes.txt', 'text/plain'))).toBe(false);
  });
});
