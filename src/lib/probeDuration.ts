import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SAFE_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi'];

export class ProbeDurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProbeDurationError';
  }
}

function safeExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return SAFE_EXTENSIONS.includes(extension) ? extension : 'mp3';
}

export function probeFileDuration(filePath: string) {
  return new Promise<number>((resolve, reject) => {
    let settled = false;
    const finish = (settle: () => void) => {
      if (settled) return;
      settled = true;
      settle();
    };

    const child = spawn(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath,
      ],
      { windowsHide: true },
    );

    let stdout = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      finish(() => {
        if (error.code === 'ENOENT') {
          reject(new ProbeDurationError('ffprobe is not installed on this machine.'));
          return;
        }
        reject(new ProbeDurationError('Could not measure the recording length.'));
      });
    });

    child.on('close', (code) => {
      finish(() => {
        const seconds = Number(stdout.trim());
        if (code !== 0 || !Number.isFinite(seconds)) {
          reject(new ProbeDurationError('Could not measure the recording length.'));
          return;
        }
        resolve(seconds);
      });
    });
  });
}

export async function probeBufferDuration(bytes: Buffer, fileName: string) {
  const directory = await mkdtemp(join(tmpdir(), 'cadence-probe-'));
  const filePath = join(directory, `source.${safeExtension(fileName)}`);

  try {
    await writeFile(filePath, bytes);
    return await probeFileDuration(filePath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
