import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const TRANSCRIPTION_MODELS = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.5-transcribe'];

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

    let transcript = '';
    let lastError = null;

    for (const modelName of TRANSCRIPTION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
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
        transcript = result.response.text().trim();
        break;
      } catch (err: any) {
        console.warn(`Transcription model ${modelName} failed (${err?.message?.slice(0, 100)}), trying next...`);
        lastError = err;
      }
    }

    if (!transcript && lastError) {
      throw lastError;
    }

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
