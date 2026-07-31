import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';

  const hackathons = [
    {
      id: 'global-ai-agentic-hackathon-2026',
      title: 'Global AI Agentic Hackathon 2026',
      slug: 'global-ai-agentic-hackathon-2026',
      tagLine: 'Build multi-agent autonomous software using LLMs & Neural Workflows',
      description: 'The world premier AI agent challenge. Compete against top developers globally to craft autonomous agents, swarm intelligence models, and developer tools.',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      organizer: 'OpenAI Labs',
      locationType: 'ONLINE',
      startDate: '2026-08-15',
      endDate: '2026-08-18',
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
    },
    {
      id: 'quantum-web3-defi-summit',
      title: 'Quantum Web3 & DeFi Summit',
      slug: 'quantum-web3-defi-summit',
      tagLine: 'Next-gen decentralized finance and cryptographic zero-knowledge protocols',
      description: 'Design ultra-fast zero-knowledge proof rollups, automated market makers, and cross-chain liquid staking protocols.',
      bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
      organizer: 'Ethereum Foundation',
      locationType: 'HYBRID',
      city: 'Berlin',
      country: 'Germany',
      startDate: '2026-09-01',
      endDate: '2026-09-04',
      prizePool: 75000,
      currency: 'USD',
      matchingScore: 92,
      tags: ['Solidity', 'Zero Knowledge', 'Rust', 'DeFi'],
      requirements: ['Smart Contract Audit Log', 'Live Testnet Deployment'],
      timeline: [
        { stage: 'Registration', date: '2026-07-15' },
        { stage: 'Hackathon', date: '2026-09-01' },
      ],
    },
    {
      id: 'fintech-ai-disruption-challenge',
      title: 'FinTech AI Disruption Challenge 2026',
      slug: 'fintech-ai-disruption-challenge',
      tagLine: 'Reinventing retail banking, credit scoring, and fraud detection with AI',
      description: 'Build predictive AI risk evaluation engines, real-time micro-lending platforms, and fraud prevention pipelines.',
      bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200',
      organizer: 'Stripe & Plaid',
      locationType: 'ONLINE',
      startDate: '2026-08-25',
      endDate: '2026-08-28',
      prizePool: 50000,
      currency: 'USD',
      matchingScore: 95,
      tags: ['FinTech', 'AI', 'Stripe', 'React', 'Node.js'],
      requirements: ['Live API Demo', 'Code Repository'],
      timeline: [
        { stage: 'Kickoff', date: '2026-08-25' },
        { stage: 'Demo Day', date: '2026-08-28' },
      ],
    },
  ];

  const filtered = hackathons.filter((h) => {
    const matchesSearch = search === '' || h.title.toLowerCase().includes(search.toLowerCase()) || h.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || h.tags.some(t => t.toLowerCase().includes(category.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  return NextResponse.json({ hackathons: filtered, total: filtered.length });
}
