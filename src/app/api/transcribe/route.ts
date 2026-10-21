import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { joinBrokenSegments } from '@/lib/transcriptSegments';

const MODEL = 'gemini-3.8-flash';

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
  return raw.replace(/key=[^&\s"']+/gi, 'key=redacted').slice(0, 400);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file was sent.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in .env.local.' },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

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
      {
        inlineData: {
          mimeType: audioMimeType(file),
          data: base64Audio,
        },
      },
    ]);

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    if (Array.isArray(parsedData.segments)) {
      parsedData.segments = joinBrokenSegments(parsedData.segments);
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    const message = safeErrorMessage(error);
    console.error('Gemini transcription failed:', message);

    return NextResponse.json(
      { error: `Failed to process the audio with Gemini. ${message}` },
      { status: 500 }
    );
  }
}