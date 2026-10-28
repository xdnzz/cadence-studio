import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileState, GoogleAIFileManager } from '@google/generative-ai/server';
import { Agent, setGlobalDispatcher } from 'undici';
import { ProbeDurationError, probeBufferDuration } from '@/lib/probeDuration';
import { joinBrokenSegments } from '@/lib/transcriptSegments';
import {
  AUDIO_TOO_LONG_MESSAGE,
  UPLOAD_TOO_LARGE_MESSAGE,
  audioTooLong,
  uploadTooLarge,
} from '@/lib/usagePolicy';
import { UsageLimitError, reserveTranscription } from '@/lib/usageQuota';

export const maxDuration = 1800;

const REQUEST_TIMEOUT = 30 * 60 * 1000;

setGlobalDispatcher(
  new Agent({
    headersTimeout: REQUEST_TIMEOUT,
    bodyTimeout: REQUEST_TIMEOUT,
    connectTimeout: 60 * 1000,
  }),
);

const MODEL = 'gemini-3.8-flash';
const INLINE_AUDIO_LIMIT = 15 * 1024 * 1024;

function audioMimeType(file: File) {
  const type = file.type.toLowerCase();

  if (type === 'audio/mpeg' || type === 'audio/mp3') return 'audio/mp3';
  if (type === 'audio/wav' || type === 'audio/x-wav' || type === 'audio/wave') return 'audio/wav';
  if (type === 'audio/mp4' || type === 'audio/m4a' || type === 'audio/x-m4a' || type === 'audio/aac') {
    return 'audio/aac';
  }

  return type || 'audio/mp3';
}

function safeErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : 'Unknown Gemini error';
  const cleaned = raw.replace(/key=[^&\s"']+/gi, 'key=redacted');
  if (cleaned.includes('fetch failed')) {
    return 'Gemini took too long to answer. Send the recording again and leave this window open.';
  }
  return cleaned.slice(0, 400);
}

async function audioPart(apiKey: string, bytes: Buffer, mimeType: string) {
  if (bytes.byteLength <= INLINE_AUDIO_LIMIT) {
    return {
      inlineData: {
        mimeType,
        data: bytes.toString('base64'),
      },
    };
  }

  const fileManager = new GoogleAIFileManager(apiKey, { timeout: REQUEST_TIMEOUT });
  let uploaded = (await fileManager.uploadFile(bytes, {
    mimeType,
    displayName: 'meeting-audio',
  })).file;

  for (let attempt = 0; attempt < 90 && uploaded.state === FileState.PROCESSING; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    uploaded = await fileManager.getFile(uploaded.name);
  }

  if (uploaded.state !== FileState.ACTIVE) {
    throw new Error('Gemini could not process the audio file.');
  }

  return {
    fileData: {
      mimeType: uploaded.mimeType,
      fileUri: uploaded.uri,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No audio file was sent.' },
        { status: 400 }
      );
    }

    if (uploadTooLarge(file.size)) {
      return NextResponse.json({ error: UPLOAD_TOO_LARGE_MESSAGE }, { status: 413 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in .env.local.' },
        { status: 500 }
      );
    }

    const audio = Buffer.from(await file.arrayBuffer());
    const seconds = await probeBufferDuration(audio, file.name);

    if (audioTooLong(seconds)) {
      return NextResponse.json({ error: AUDIO_TOO_LONG_MESSAGE }, { status: 413 });
    }

    await reserveTranscription();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      },
      { timeout: REQUEST_TIMEOUT },
    );

    const prompt = `
Analyze this audio recording.
Transcribe verbatim in the language that was spoken. Do not translate.
Each transcript segment must be one complete spoken sentence or one uninterrupted speaker turn.
Never split a sentence across segments. A segment must not end with a comma, and the next segment must not start with a continuation such as "e", "and", or a lowercase word.
Keep word timestamps inside the segment they belong to.
Also generate meeting intelligence.
Return strict JSON matching this exact structure:
{
  "segments": [
    {
      "id": "seg-0",
      "speakerId": "spk-1",
      "speakerName": "Speaker 1",
      "start": 0.0,
      "end": 4.5,
      "text": "Full text of this sentence",
      "words": [
        {
          "id": "w-0-0",
          "word": "Full",
          "start": 0.0,
          "end": 0.5,
          "confidence": 0.99
        }
      ]
    }
  ],
  "intelligence": {
    "overview": "Concise executive overview of what was discussed",
    "takeaways": [
      {
        "id": "t-0",
        "topic": "Topic Name",
        "summary": "Brief explanation",
        "timestamp": 0.0
      }
    ],
    "actionItems": [
      {
        "id": "a-0",
        "title": "Action title",
        "priority": "high",
        "status": "pending",
        "originTimestamp": 0.0,
        "assignee": "Speaker 1"
      }
    ],
    "sentiment": {
      "overall": "positive",
      "score": 0.85
    }
  }
}
`;

    const result = await model.generateContent([
      prompt,
      await audioPart(apiKey, audio, audioMimeType(file)),
    ]);

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    if (Array.isArray(parsedData.segments)) {
      parsedData.segments = joinBrokenSegments(parsedData.segments);
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    if (error instanceof UsageLimitError || error instanceof ProbeDurationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error instanceof UsageLimitError ? 429 : 400 },
      );
    }

    const message = safeErrorMessage(error);
    console.error('Gemini transcription failed:', message);

    return NextResponse.json(
      { error: `Failed to process the audio with Gemini. ${message}` },
      { status: 500 }
    );
  }
}