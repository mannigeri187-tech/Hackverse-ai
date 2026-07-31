import { NextResponse } from 'next/server';
import { HackVerseAIEngine } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const { githubUrl, demoUrl } = await request.json();

    const evaluation = await HackVerseAIEngine.evaluateSubmission(githubUrl, demoUrl);

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to evaluate submission' }, { status: 500 });
  }
}
