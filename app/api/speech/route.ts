import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with the provided API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Text-to-Speech endpoint
export async function POST(request: NextRequest) {
  try {
    const { text, action } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (action === 'text-to-speech') {
      // Convert text to speech using OpenAI's TTS
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      // Convert the audio response to an ArrayBuffer
      const audioBuffer = await audioResponse.arrayBuffer();

      // Return the audio data as a response
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Speech API error:', error);
    return NextResponse.json(
      { error: 'Speech processing error' },
      { status: 500 }
    );
  }
}

// Speech-to-Text endpoint
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert the audio to text using OpenAI's Whisper model
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'tr',
    });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error('Speech-to-Text API error:', error);
    return NextResponse.json(
      { error: 'Speech-to-Text processing error' },
      { status: 500 }
    );
  }
} 