import { NextResponse } from 'next/server';
import { HackVerseAIEngine } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain = 'AI', difficulty = 'Hard', techStack = ['TypeScript', 'Next.js'], durationHours = 24 } = body;

    const challenge = await HackVerseAIEngine.generateMockHackathon({
      domain,
      difficulty,
      techStack,
      durationHours,
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI Mock Hackathon' }, { status: 500 });
  }
}
