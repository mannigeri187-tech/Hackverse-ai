export const APP_NAME = 'HackVerse AI'
export const APP_DESCRIPTION = 'AI-Powered Hackathon Preparation Platform'

export const HACKATHON_CATEGORIES = [
  'All', 'AI / ML', 'Web3 / Blockchain', 'FinTech', 'HealthTech', 'EdTech',
  'DevTools', 'IoT', 'Cybersecurity', 'Cloud', 'Mobile', 'Open Innovation',
] as const

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const
export const MOCK_DURATIONS = ['2 hours', '6 hours', '12 hours', '24 hours'] as const

export const SKILL_CATEGORIES = [
  'Frontend', 'Backend', 'AI / ML', 'Cloud', 'Cybersecurity',
  'Blockchain', 'Mobile', 'UI/UX', 'DevOps', 'Data Science',
] as const

export const LEARNING_TOPICS = [
  { id: 'frontend', name: 'Frontend Development', icon: 'Monitor', color: 'from-blue-500 to-cyan-500', courses: 12 },
  { id: 'backend', name: 'Backend Development', icon: 'Server', color: 'from-emerald-500 to-teal-500', courses: 10 },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: 'Brain', color: 'from-purple-500 to-pink-500', courses: 15 },
  { id: 'cloud', name: 'Cloud Computing', icon: 'Cloud', color: 'from-sky-500 to-blue-500', courses: 8 },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: 'Shield', color: 'from-red-500 to-orange-500', courses: 7 },
  { id: 'blockchain', name: 'Blockchain & Web3', icon: 'Blocks', color: 'from-amber-500 to-yellow-500', courses: 6 },
  { id: 'mobile', name: 'App Development', icon: 'Smartphone', color: 'from-green-500 to-emerald-500', courses: 9 },
  { id: 'uiux', name: 'UI/UX Design', icon: 'Palette', color: 'from-pink-500 to-rose-500', courses: 8 },
  { id: 'problem-solving', name: 'Problem Solving', icon: 'Lightbulb', color: 'from-indigo-500 to-violet-500', courses: 11 },
] as const

export const RESUME_TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary design', color: 'from-brand-500 to-cyber-purple' },
  { id: 'professional', name: 'Professional', description: 'Classic corporate style', color: 'from-gray-700 to-gray-900' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', color: 'from-emerald-500 to-teal-500' },
  { id: 'tech', name: 'Tech', description: 'Developer-focused layout', color: 'from-cyber-cyan to-brand-500' },
] as const

export const ACHIEVEMENTS = [
  { id: 'first-hackathon', name: 'First Steps', description: 'Join your first hackathon', icon: '🚀', xp: 100 },
  { id: 'mock-master', name: 'Mock Master', description: 'Complete 5 mock hackathons', icon: '🏆', xp: 500 },
  { id: 'ai-explorer', name: 'AI Explorer', description: 'Have 50 conversations with AI Mentor', icon: '🤖', xp: 300 },
  { id: 'resume-pro', name: 'Resume Pro', description: 'Achieve 90+ ATS score', icon: '📄', xp: 200 },
  { id: 'code-warrior', name: 'Code Warrior', description: 'Complete 10 coding challenges', icon: '⚔️', xp: 400 },
  { id: 'team-player', name: 'Team Player', description: 'Join 3 hackathon teams', icon: '🤝', xp: 250 },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintain a 30-day streak', icon: '🔥', xp: 1000 },
  { id: 'community-star', name: 'Community Star', description: 'Get 100 likes on posts', icon: '⭐', xp: 350 },
  { id: 'skill-ninja', name: 'Skill Ninja', description: 'Master 5 skill categories', icon: '🥷', xp: 600 },
  { id: 'hackathon-winner', name: 'Hackathon Winner', description: 'Win a hackathon', icon: '👑', xp: 2000 },
] as const

export const MOTIVATION_QUOTES = [
  { quote: "The best time to start was yesterday. The next best time is now.", author: "Unknown" },
  { quote: "Every expert was once a beginner. Keep hacking!", author: "Helen Hayes" },
  { quote: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { quote: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { quote: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { quote: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { quote: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { quote: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { quote: "Great builders don't build alone—they collaborate and inspire.", author: "HackVerse AI" },
  { quote: "Small daily improvements over time lead to stunning hackathon results.", author: "Robin Sharma" },
  { quote: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { quote: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Abelson & Sussman" },
  { quote: "The most impactful prototypes solve simple problems for real people.", author: "Paul Graham" },
  { quote: "Success in hackathons comes from relentless focus on the core demo.", author: "HackVerse Coach" },
  { quote: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
  { quote: "Future belongs to those who build it, line by line.", author: "Elon Musk" },
  { quote: "Strive for progress, not perfection.", author: "Unknown" },
  { quote: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { quote: "Your limit is only your imagination.", author: "HackVerse AI" },
  { quote: "Knowledge is power, but execution is king.", author: "Unknown" },
  { quote: "Turn caffeine into scalable software architecture.", author: "HackVerse Developer" },
  { quote: "Focus on impact, ship early, and iterate fast.", author: "Mark Zuckerberg" },
  { quote: "Consistency is what transforms average effort into excellence.", author: "Unknown" },
  { quote: "Dream big, build fast, and pitch with passion.", author: "HackVerse AI" },
  { quote: "Winners don't quit when tests fail; they debug until they succeed.", author: "Senior Architect" },
]

export const NAV_LINKS = [
  { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Hackathons', path: '/hackathons', icon: 'Trophy' },
  { name: 'HackVerse Mentor', path: '/ai-mentor', icon: 'Bot' },
  { name: 'HackVerse Teams', path: '/teammate-matchmaker', icon: 'Flame' },
  { name: 'Live Event Ops', path: '/live-ops', icon: 'Radio' },
  { name: 'HackVerse Judge', path: '/judging-hub', icon: 'QrCode' },
  { name: 'HackVerse Recruit', path: '/sponsor-hub', icon: 'Zap' },
  { name: 'HackVerse Learn', path: '/learning', icon: 'GraduationCap' },
  { name: 'HackVerse Arena', path: '/mock-hackathon', icon: 'Timer' },
  { name: 'Skill Analysis', path: '/skill-analysis', icon: 'BarChart3' },
  { name: 'HackVerse Resume', path: '/resume-builder', icon: 'FileText' },
  { name: 'Resume Review', path: '/resume-review', icon: 'FileSearch' },
  { name: 'HackVerse Studio', path: '/project-generator', icon: 'Lightbulb' },
  { name: 'Analytics', path: '/analytics', icon: 'TrendingUp' },
  { name: 'Community', path: '/community', icon: 'Users' },
  { name: 'Team Finder', path: '/team-finder', icon: 'UserPlus' },
  { name: 'Leaderboard', path: '/leaderboard', icon: 'Award' },
  { name: 'Interview Prep', path: '/interview-prep', icon: 'Mic' },
] as const

export const SAMPLE_HACKATHONS = [
  {
    id: '1', name: 'Global AI Innovation Hackathon 2026', organizer: 'Google DeepMind',
    description: 'Build cutting-edge AI solutions that tackle real-world challenges. Open to students worldwide.',
    registrationDate: '2026-08-01', startDate: '2026-09-15', endDate: '2026-09-17',
    prizePool: 100000, location: 'Online', mode: 'Online' as const, difficulty: 'Advanced' as const,
    technology: ['Python', 'TensorFlow', 'PyTorch', 'LLMs'], teamSize: '2-5',
    eligibility: 'College students worldwide', website: 'https://ai-hackathon.dev',
    category: 'AI / ML', aiMatchScore: 98, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    bookmarked: false, tags: ['AI', 'Machine Learning', 'Deep Learning'],
    state: '', city: '', college: '',
  },
  {
    id: '2', name: 'Web3 DeFi Summit Hackathon', organizer: 'Ethereum Foundation',
    description: 'Reimagine decentralized finance with innovative blockchain solutions and smart contracts.',
    registrationDate: '2026-08-10', startDate: '2026-10-01', endDate: '2026-10-03',
    prizePool: 75000, location: 'Berlin, Germany', mode: 'Hybrid' as const, difficulty: 'Intermediate' as const,
    technology: ['Solidity', 'Rust', 'React', 'Web3.js'], teamSize: '3-4',
    eligibility: 'Open to all developers', website: 'https://web3-defi.hack',
    category: 'Web3 / Blockchain', aiMatchScore: 85, image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    bookmarked: false, tags: ['Blockchain', 'DeFi', 'Smart Contracts'],
    state: 'Berlin', city: 'Berlin', college: '',
  },
  {
    id: '3', name: 'HealthTech Innovation Challenge', organizer: 'Microsoft',
    description: 'Use technology to improve healthcare outcomes. Build apps, devices, or AI models that save lives.',
    registrationDate: '2026-08-05', startDate: '2026-09-20', endDate: '2026-09-22',
    prizePool: 50000, location: 'Bangalore, India', mode: 'Offline' as const, difficulty: 'Beginner' as const,
    technology: ['React', 'Node.js', 'Python', 'TensorFlow'], teamSize: '2-4',
    eligibility: 'Indian college students', website: 'https://healthtech.hack',
    category: 'HealthTech', aiMatchScore: 92, image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    bookmarked: true, tags: ['HealthTech', 'AI', 'Mobile'],
    state: 'Karnataka', city: 'Bangalore', college: 'IISc Bangalore',
  },
  {
    id: '4', name: 'FinTech Disruption Hackathon', organizer: 'JPMorgan Chase',
    description: 'Build next-generation financial tools. Focus on payments, lending, or investment platforms.',
    registrationDate: '2026-08-15', startDate: '2026-10-10', endDate: '2026-10-12',
    prizePool: 60000, location: 'New York, USA', mode: 'Hybrid' as const, difficulty: 'Advanced' as const,
    technology: ['Java', 'Python', 'React', 'PostgreSQL'], teamSize: '3-5',
    eligibility: 'University students & recent grads', website: 'https://fintech.hack',
    category: 'FinTech', aiMatchScore: 78, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    bookmarked: false, tags: ['FinTech', 'Banking', 'Payments'],
    state: 'New York', city: 'New York City', college: 'Columbia University',
  },
  {
    id: '5', name: 'Cloud-Native DevOps Challenge', organizer: 'AWS',
    description: 'Design scalable cloud architectures and implement CI/CD pipelines for modern applications.',
    registrationDate: '2026-08-20', startDate: '2026-10-20', endDate: '2026-10-21',
    prizePool: 40000, location: 'Online', mode: 'Online' as const, difficulty: 'Intermediate' as const,
    technology: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], teamSize: '1-3',
    eligibility: 'All skill levels welcome', website: 'https://cloud-devops.hack',
    category: 'Cloud', aiMatchScore: 88, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    bookmarked: false, tags: ['Cloud', 'DevOps', 'Infrastructure'],
    state: '', city: '', college: '',
  },
  {
    id: '6', name: 'Cybersecurity CTF Challenge', organizer: 'CrowdStrike',
    description: 'Test your cybersecurity skills in capture-the-flag challenges across multiple domains.',
    registrationDate: '2026-09-01', startDate: '2026-11-01', endDate: '2026-11-02',
    prizePool: 30000, location: 'San Francisco, USA', mode: 'Offline' as const, difficulty: 'Expert' as const,
    technology: ['Python', 'C', 'Wireshark', 'Metasploit'], teamSize: '2-4',
    eligibility: 'Security enthusiasts', website: 'https://ctf-challenge.hack',
    category: 'Cybersecurity', aiMatchScore: 72, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    bookmarked: false, tags: ['Security', 'CTF', 'Pentesting'],
    state: 'California', city: 'San Francisco', college: 'Stanford University',
  },
]

export const SAMPLE_USER = {
  id: 'user-1',
  name: 'Alex Vance',
  email: 'alex@hackverse.ai',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  college: 'MIT',
  year: '3rd Year',
  branch: 'Computer Science',
  level: 14,
  xp: 14250,
  streak: 19,
  hackathonsWon: 3,
  hackathonsJoined: 8,
  recruiterViews: 47,
  preparationScore: 87,
  resumeScore: 82,
  mockTestScore: 91,
  role: 'student' as const,
  skills: ['React', 'TypeScript', 'Python', 'TensorFlow', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
  interests: ['AI / ML', 'Web Development', 'Cloud'],
  linkedin: 'https://linkedin.com/in/alexvance',
  github: 'https://github.com/alexvance',
  joinedDate: '2026-01-15',
}

export const SAMPLE_LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma', college: 'IIT Delhi', xp: 28500, level: 24, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', badges: 12 },
  { rank: 2, name: 'James Chen', college: 'Stanford', xp: 25200, level: 22, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', badges: 10 },
  { rank: 3, name: 'Sarah Wilson', college: 'MIT', xp: 22800, level: 20, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', badges: 9 },
  { rank: 4, name: 'Alex Vance', college: 'MIT', xp: 14250, level: 14, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', badges: 7, isCurrentUser: true },
  { rank: 5, name: 'Ravi Kumar', college: 'IISc Bangalore', xp: 13100, level: 13, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', badges: 6 },
  { rank: 6, name: 'Emma Davis', college: 'Harvard', xp: 11800, level: 12, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', badges: 5 },
  { rank: 7, name: 'Liu Wei', college: 'Tsinghua', xp: 10500, level: 11, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', badges: 5 },
  { rank: 8, name: 'Anna Kowalski', college: 'ETH Zurich', xp: 9800, level: 10, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', badges: 4 },
]
