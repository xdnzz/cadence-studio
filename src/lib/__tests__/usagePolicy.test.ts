import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AUDIO_TOO_LONG_MESSAGE,
  DAILY_LIMIT_MESSAGE,
  MAX_AUDIO_SECONDS,
  MAX_TRANSCRIPTIONS_PER_DAY,
  MAX_UPLOAD_BYTES,
  audioTooLong,
  uploadTooLarge,
  usageDay,
} from '../usagePolicy';
import { UsageLimitError, createUsageQuota } from '../usageQuota';

describe('beta usage policy', () => {
  it('accepts files up to 100 MB', () => {
    expect(uploadTooLarge(MAX_UPLOAD_BYTES)).toBe(false);
    expect(uploadTooLarge(MAX_UPLOAD_BYTES + 1)).toBe(true);
  });

  it('accepts recordings up to 15 minutes', () => {
    expect(audioTooLong(MAX_AUDIO_SECONDS)).toBe(false);
    expect(audioTooLong(MAX_AUDIO_SECONDS + 0.01)).toBe(true);
    expect(audioTooLong(Number.NaN)).toBe(true);
    expect(audioTooLong(Number.POSITIVE_INFINITY)).toBe(true);
  });

  it('counts the day in America/Sao_Paulo', () => {
    expect(usageDay(new Date('2026-10-28T02:30:00.000Z'))).toBe('2026-10-27');
    expect(usageDay(new Date('2026-10-28T03:00:00.000Z'))).toBe('2026-10-28');
  });

  it('allows five transcriptions per day and keeps them after a failure', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cadence-usage-'));
    const clock = new Date('2026-10-28T15:00:00.000Z');
    const quota = createUsageQuota({
      directory,
      now: () => clock,
    });

    for (let attempt = 0; attempt < MAX_TRANSCRIPTIONS_PER_DAY; attempt += 1) {
      await quota.reserveTranscription();
    }

    await expect(quota.reserveTranscription()).rejects.toBeInstanceOf(UsageLimitError);
    await expect(quota.reserveTranscription()).rejects.toThrow(DAILY_LIMIT_MESSAGE);
    expect(await quota.transcriptionsRemaining()).toBe(0);

    const stored = JSON.parse(await readFile(join(directory, 'usage.json'), 'utf8')) as {
      count: number;
    };
    expect(stored.count).toBe(MAX_TRANSCRIPTIONS_PER_DAY);
    expect(AUDIO_TOO_LONG_MESSAGE).toContain('15 minutes');
  });

  it('starts a new count on the next Sao Paulo day', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cadence-usage-'));
    let clock = new Date('2026-10-28T02:30:00.000Z');
    const quota = createUsageQuota({
      directory,
      now: () => clock,
    });

    await quota.reserveTranscription();
    clock = new Date('2026-10-28T03:00:00.000Z');

    expect(await quota.transcriptionsRemaining()).toBe(MAX_TRANSCRIPTIONS_PER_DAY);
    expect(await quota.reserveTranscription()).toBe(MAX_TRANSCRIPTIONS_PER_DAY - 1);
  });

  it('does not let parallel reservations pass the daily cap', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cadence-usage-'));
    const quota = createUsageQuota({ directory });
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => quota.reserveTranscription()),
    );

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(
      MAX_TRANSCRIPTIONS_PER_DAY,
    );
    expect(await quota.transcriptionsRemaining()).toBe(0);
  });
});
