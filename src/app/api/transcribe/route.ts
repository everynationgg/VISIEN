import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const TRANSCRIPTION_MODEL = 'gemini-3.5-flash-lite';

export async function POST(request: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('audio') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    const rawMime = file.type || 'audio/webm';
    // Clean mime type (e.g. 'audio/webm;codecs=opus' -> 'audio/webm')
    const mimeType = rawMime.split(';')[0].trim();

    const model = genAI.getGenerativeModel({
      model: TRANSCRIPTION_MODEL,
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Audio,
        },
      },
      {
        text: 'Transcribe the spoken speech from this audio recording into clean text. Return ONLY the transcribed words. Do NOT add any preamble, notes, formatting, or quotes. If the audio is silent or unintelligible, return an empty string.',
      },
    ]);

    const transcript = result.response.text().trim();
    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
