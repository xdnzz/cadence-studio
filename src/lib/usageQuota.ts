import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  DAILY_LIMIT_MESSAGE,
  MAX_TRANSCRIPTIONS_PER_DAY,
  usageDay,
} from '@/lib/usagePolicy';

export class UsageLimitError extends Error {
  constructor() {
    super(DAILY_LIMIT_MESSAGE);
    this.name = 'UsageLimitError';
  }
}

type UsageRecord = {
  day: string;
  count: number;
};

type UsageQuotaOptions = {
  directory: string;
  now?: () => Date;
};

function isUsageRecord(value: unknown): value is UsageRecord {
  if (typeof value !== 'object' || value === null) return false;
  if (!('day' in value) || !('count' in value)) return false;
  return typeof value.day === 'string' && typeof value.count === 'number' && Number.isFinite(value.count);
}

export function createUsageQuota(options: UsageQuotaOptions) {
  const usagePath = join(options.directory, 'usage.json');
  const now = options.now ?? (() => new Date());
  let pending: Promise<unknown> = Promise.resolve();

  function enqueue<T>(task: () => Promise<T>) {
    const run = pending.then(task, task);
    pending = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function readUsage(): Promise<UsageRecord> {
    const today = usageDay(now());
    try {
      const parsed: unknown = JSON.parse(await readFile(usagePath, 'utf8'));
      if (isUsageRecord(parsed)) return parsed;
    } catch {
      return { day: today, count: 0 };
    }
    return { day: today, count: 0 };
  }

  function countForToday(record: UsageRecord) {
    return record.day === usageDay(now()) ? record.count : 0;
  }

  async function transcriptionsRemaining() {
    const record = await readUsage();
    return Math.max(0, MAX_TRANSCRIPTIONS_PER_DAY - countForToday(record));
  }

  async function reserveTranscription() {
    return enqueue(async () => {
      const today = usageDay(now());
      const count = countForToday(await readUsage());
      if (count >= MAX_TRANSCRIPTIONS_PER_DAY) {
        throw new UsageLimitError();
      }

      await mkdir(options.directory, { recursive: true });
      const next = count + 1;
      await writeFile(usagePath, JSON.stringify({ day: today, count: next }));
      return MAX_TRANSCRIPTIONS_PER_DAY - next;
    });
  }

  return { transcriptionsRemaining, reserveTranscription };
}

const quota = createUsageQuota({
  directory: process.env.VERCEL ? join(tmpdir(), 'cadence-usage') : join(process.cwd(), '.data'),
});

export function transcriptionsRemaining() {
  return quota.transcriptionsRemaining();
}

export function reserveTranscription() {
  return quota.reserveTranscription();
}
