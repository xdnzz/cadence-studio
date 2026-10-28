import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { ProbeDurationError, probeFileDuration } from '@/lib/probeDuration';
import {
  AUDIO_TOO_LONG_MESSAGE,
  UPLOAD_TOO_LARGE_MESSAGE,
  audioTooLong,
  uploadTooLarge,
} from '@/lib/usagePolicy';

export const maxDuration = 1800;

function inputExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi'].includes(fromName)) return fromName;
  if (file.type === 'video/quicktime') return 'mov';
  if (file.type === 'video/webm') return 'webm';
  return 'mp4';
}

function runFfmpeg(inputPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      'ffmpeg',
      ['-y', '-i', inputPath, '-vn', '-ac', '1', '-ar', '44100', '-b:a', '64k', outputPath],
      { windowsHide: true },
    );

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        reject(new Error('ffmpeg is not installed on this machine.'));
        return;
      }
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('Could not read the audio from this video.'));
    });
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No video file was sent.' }, { status: 400 });
  }

  if (uploadTooLarge(file.size)) {
    return NextResponse.json({ error: UPLOAD_TOO_LARGE_MESSAGE }, { status: 413 });
  }

  const directory = await mkdtemp(join(tmpdir(), 'cadence-'));
  const inputPath = join(directory, `source.${inputExtension(file)}`);
  const outputPath = join(directory, 'meeting.mp3');

  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    const seconds = await probeFileDuration(inputPath);
    if (audioTooLong(seconds)) {
      return NextResponse.json({ error: AUDIO_TOO_LONG_MESSAGE }, { status: 413 });
    }
    await runFfmpeg(inputPath, outputPath);
    const audio = await readFile(outputPath);

    return new NextResponse(new Uint8Array(audio), {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    if (error instanceof ProbeDurationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Could not read the audio from this video.';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
