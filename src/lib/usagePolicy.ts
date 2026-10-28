export const MAX_AUDIO_SECONDS = 15 * 60;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const MAX_TRANSCRIPTIONS_PER_DAY = 5;

export const UPLOAD_TOO_LARGE_MESSAGE =
  'This file is larger than 100 MB. The beta accepts recordings up to 100 MB.';

export const AUDIO_TOO_LONG_MESSAGE =
  'This recording is longer than 15 minutes. The beta accepts up to 15 minutes.';

export const DAILY_LIMIT_MESSAGE =
  'The beta limit is 5 transcriptions a day. Try again tomorrow.';

export function uploadTooLarge(byteLength: number) {
  return byteLength > MAX_UPLOAD_BYTES;
}

export function audioTooLong(seconds: number) {
  return !Number.isFinite(seconds) || seconds > MAX_AUDIO_SECONDS;
}

export function usageDay(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
