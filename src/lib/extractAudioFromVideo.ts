const FFMPEG_SCRIPT = '/ffmpeg/ffmpeg.js';
const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
const BROWSER_VIDEO_EXTRACT_LIMIT = 80 * 1024 * 1024;

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'];

interface FfmpegInstance {
  load: (config?: { coreURL?: string; wasmURL?: string }) => Promise<boolean>;
  exec: (args: string[]) => Promise<number>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array | string>;
  deleteFile: (path: string) => Promise<void>;
}

interface FfmpegWasm {
  FFmpeg: new () => FfmpegInstance;
}

export class RecordingProcessError extends Error {}

let ffmpegPromise: Promise<FfmpegInstance> | null = null;

function extension(file: File) {
  const match = /\.([a-z0-9]+)$/i.exec(file.name);
  return match?.[1]?.toLowerCase() ?? '';
}

export function isVideoFile(file: File) {
  if (file.type.startsWith('video/')) return true;
  if (file.type.startsWith('audio/')) return false;
  return VIDEO_EXTENSIONS.includes(extension(file));
}

export function isAudioFile(file: File) {
  if (isVideoFile(file)) return false;
  if (file.type.startsWith('audio/')) return true;
  return AUDIO_EXTENSIONS.includes(extension(file));
}

export function videoNeedsServerExtract(byteLength: number) {
  return byteLength > BROWSER_VIDEO_EXTRACT_LIMIT;
}

function ffmpegWasm() {
  return (window as Window & { FFmpegWASM?: FfmpegWasm }).FFmpegWASM;
}

function loadScript(src: string) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new RecordingProcessError('Could not read the audio from this video.'));
    document.head.appendChild(script);
  });
}

async function loadFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      await loadScript(FFMPEG_SCRIPT);
      const wasm = ffmpegWasm();
      if (!wasm) {
        throw new RecordingProcessError('Could not read the audio from this video.');
      }
      const ffmpeg = new wasm.FFmpeg();
      await ffmpeg.load({
        coreURL: `${CORE_BASE}/ffmpeg-core.js`,
        wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
      });
      return ffmpeg;
    })().catch((error: unknown) => {
      ffmpegPromise = null;
      if (error instanceof RecordingProcessError) throw error;
      throw new RecordingProcessError('Could not read the audio from this video.');
    });
  }

  return ffmpegPromise;
}

async function removeFile(ffmpeg: FfmpegInstance, name: string) {
  try {
    await ffmpeg.deleteFile(name);
  } catch {
    return;
  }
}

export async function extractAudioOnServer(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/extract-audio', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new RecordingProcessError(payload?.error || 'Could not read the audio from this video.');
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'meeting';
  return new File([await response.blob()], `${baseName}.mp3`, { type: 'audio/mpeg' });
}

export async function extractAudioFromVideo(file: File) {
  if (videoNeedsServerExtract(file.size)) {
    return extractAudioOnServer(file);
  }

  const ffmpeg = await loadFfmpeg();

  const inputName = `source.${VIDEO_EXTENSIONS.includes(extension(file)) ? extension(file) : 'mp4'}`;
  const outputName = 'meeting.mp3';

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

  try {
    const code = await ffmpeg.exec([
      '-i',
      inputName,
      '-vn',
      '-ac',
      '1',
      '-ar',
      '44100',
      '-b:a',
      '64k',
      outputName,
    ]);

    if (code !== 0) {
      throw new RecordingProcessError('Could not read the audio from this video.');
    }

    const data = await ffmpeg.readFile(outputName);
    if (!(data instanceof Uint8Array)) {
      throw new RecordingProcessError('Could not read the audio from this video.');
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'meeting';
    return new File([new Uint8Array(data)], `${baseName}.mp3`, { type: 'audio/mpeg' });
  } catch (error) {
    if (error instanceof RecordingProcessError) throw error;
    throw new RecordingProcessError('Could not read the audio from this video.');
  } finally {
    await removeFile(ffmpeg, inputName);
    await removeFile(ffmpeg, outputName);
  }
}
