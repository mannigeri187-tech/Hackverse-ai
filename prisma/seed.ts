// Production Seed Data for HackVerse AI
import { PrismaClient, Role, LocationType, MockStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HackVerse AI production database seeding...');

  // 1. Password Hash
  const passwordHash = await bcrypt.hash('HackVerse2026!', 10);

  // 2. Core Users
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@hackverse.ai' },
    update: {},
    create: {
      email: 'student@hackverse.ai',
      passwordHash,
      role: Role.STUDENT,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Alex Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          headline: 'Full Stack & AI Engineer | 12x Hackathon Winner',
          bio: 'Passionate about building autonomous AI agents, scalable distributed systems, and real-time WebSockets.',
          location: 'San Francisco, CA',
          githubUrl: 'https://github.com/alexvance-dev',
          linkedinUrl: 'https://linkedin.com/in/alexvance',
          xp: 14250,
          streak: 19,
          level: 14,
          coins: 850,
        },
      },
    },
    include: { profile: true },
  });

  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter@techcorp.com',
      passwordHash,
      role: Role.RECRUITER,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Elena Rostova',
          headline: 'Lead Technical Talent Recruiter at NovaAI Engine',
          location: 'New York, NY',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hackverse.ai' },
    update: {},
    create: {
      email: 'admin@hackverse.ai',
      passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'HackVerse Admin',
          headline: 'Platform Operations & System Architect',
        },
      },
    },
  });

  // 3. Companies & Hackathons
  const company = await prisma.company.create({
    data: {
      name: 'OpenAI Labs & Anthropic',
      website: 'https://openai.com',
      industry: 'Artificial Intelligence',
      verified: true,
    },
  });

  const hackathon1 = await prisma.hackathon.create({
    data: {
      title: 'Global AI Agentic Hackathon 2026',
      slug: 'global-ai-agentic-hackathon-2026',
      tagLine: 'Build multi-agent autonomous software using LLMs & Neural Workflows',
      description: 'The world premier AI agent challenge. Compete against top developers globally to craft autonomous agents, swarm intelligence models, and developer tools.',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      organizer: 'OpenAI Labs',
      locationType: LocationType.ONLINE,
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-08-18'),
      prizePool: 100000,
      currency: 'USD',
      matchingScore: 98,
      tags: ['AI Agents', 'LLMs', 'Python', 'Next.js', 'PyTorch'],
      requirements: ['Working GitHub repo', '2-minute video pitch', 'Architecture document'],
      timeline: [
        { stage: 'Registration Opens', date: '2026-07-01' },
        { stage: 'Hacking Starts', date: '2026-08-15' },
        { stage: 'Submissions Due', date: '2026-08-18' },
        { stage: 'Winners Announced', date: '2026-08-20' },
      ],
      companyId: company.id,
    },
  });

  const hackathon2 = await prisma.hackathon.create({
    data: {
      title: 'Quantum Web3 & DeFi Summit',
      slug: 'quantum-web3-defi-summit',
      tagLine: 'Next-gen decentralized finance and cryptographic zero-knowledge protocols',
      description: 'Design ultra-fast zero-knowledge proof rollups, automated market makers, and cross-chain liquid staking protocols.',
      bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
      organizer: 'Ethereum Foundation',
      locationType: LocationType.HYBRID,
      city: 'Berlin',
      country: 'Germany',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-04'),
      prizePool: 75000,
      currency: 'USD',
      matchingScore: 92,
      tags: ['Solidity', 'Zero Knowledge', 'Rust', 'DeFi'],
      requirements: ['Smart Contract Audit Log', 'Live Testnet Deployment'],
      timeline: [
        { stage: 'Registration', date: '2026-07-15' },
        { stage: 'Hackathon', date: '2026-09-01' },
      ],
      companyId: company.id,
    },
  });

  // 4. Mock Hackathon & Evaluation
  const mockHack = await prisma.mockHackathon.create({
    data: {
      userId: studentUser.id,
      title: 'AI Code Reviewer & Security Scanner',
      domain: 'AI & Developer Tools',
      difficulty: 'Hard',
      durationHours: 24,
      problemStatement: 'Build a CLI & GitHub Bot that automatically audits pull requests for OWASP Top 10 vulnerabilities, memory leaks, and performance bottlenecks using AST parsing and LLM reasoning.',
      requirements: ['Automated PR commentary', 'AST parsing', 'OWASP detection', 'Markdown report'],
      constraints: ['Latency under 3s per file', 'Zero third-party telemetry data leakage'],
      rubric: {
        innovationWeight: 0.25,
        architectureWeight: 0.25,
        uiUxWeight: 0.20,
        securityWeight: 0.30,
      },
      status: MockStatus.EVALUATED,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  await prisma.mockSubmission.create({
    data: {
      mockHackathonId: mockHack.id,
      githubUrl: 'https://github.com/alexvance/ai-pr-sentinel',
      demoUrl: 'https://ai-pr-sentinel.vercel.app',
      presentationUrl: 'https://slides.com/alexvance/ai-sentinel',
      evaluation: {
        create: {
          totalScore: 94.5,
          innovationScore: 96,
          architectureScore: 94,
          uiUxScore: 92,
          testingScore: 95,
          performanceScore: 96,
          securityScore: 94,
          strengths: [
            'Outstanding AST tree integration with LLM context windowing',
            'Flawless execution of non-blocking background queue via BullMQ',
            'Impeccable OWASP vulnerability pattern matching',
          ],
          weaknesses: [
            'Could add support for C/C++ memory safety heuristics',
            'Slight delay when scanning mono-repos over 50,000 LOC',
          ],
          improvementPlan: 'Implement worker thread streaming for large mono-repo support and add Rust FFI binding for AST parsing.',
          reportPdfUrl: '/reports/ai-pr-sentinel-evaluation.pdf',
        },
      },
    },
  });

  // 5. Achievements
  await prisma.achievement.createMany({
    data: [
      { title: 'First Hackathon Win', description: 'Placed Top 3 in an accredited global hackathon', icon: '🏆', xpBonus: 1000, category: 'HACKATHON' },
      { title: 'AI Mastermind', description: 'Generated and solved 5 AI Mock Hackathons with 90+ score', icon: '🧠', xpBonus: 750, category: 'AI' },
      { title: 'Code Warrior', description: 'Maintained a 14-day continuous coding streak', icon: '🔥', xpBonus: 500, category: 'STREAK' },
      { title: 'ATS Resume Hero', description: 'Achieved an ATS Resume Score of 95+', icon: '📄', xpBonus: 400, category: 'CAREER' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed data successfully created!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
