// HackVerse AI Engine — OpenAI integration with intelligent mock fallbacks

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

const isAIConfigured = () => OPENAI_KEY && OPENAI_KEY !== 'your_openai_api_key'

async function callOpenAI(messages: { role: string; content: string }[], maxTokens = 1000): Promise<string> {
  if (!isAIConfigured()) throw new Error('OpenAI not configured')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: maxTokens, temperature: 0.7 }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'No response generated.'
}

export interface MentorResponse {
  message: string
  suggestions?: string[]
}

export interface MockHackathonChallenge {
  title: string
  problemStatement: string
  requirements: string[]
  constraints: string[]
  evaluationCriteria: string[]
  techSuggestions: string[]
}

export interface EvaluationResult {
  overallScore: number
  scores: { category: string; score: number; feedback: string }[]
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
}

export interface ResumeAnalysis {
  atsScore: number
  formatScore: number
  keywordScore: number
  contentScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  strengths: string[]
  weaknesses: string[]
}

export interface SkillGapResult {
  missingSkills: { skill: string; priority: 'High' | 'Medium' | 'Low'; estimatedTime: string }[]
  strengths: string[]
  weaknesses: string[]
  learningPath: { step: number; topic: string; duration: string; resources: string[] }[]
  estimatedPrepTime: string
}

export interface ProjectIdea {
  name: string
  description: string
  architecture: string
  features: string[]
  techStack: string[]
  dbSchema: string
  apiEndpoints: string[]
  folderStructure: string
  deploymentGuide: string
  presentationTips: string[]
}

export interface InterviewResult {
  question: string
  userAnswer: string
  feedback: string
  score: number
  idealAnswer: string
  tips: string[]
}

export const AIEngine = {
  async getMentorResponse(message: string, history: { role: string; content: string }[] = []): Promise<MentorResponse> {
    try {
      const systemPrompt = `You are HackVerse AI Mentor, an expert hackathon coach and tech educator. You help students prepare for hackathons, learn technologies, build projects, and grow their careers. Be encouraging, detailed, and practical. Format responses with markdown for readability.`
      const response = await callOpenAI([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ], 1500)
      return { message: response, suggestions: ['Tell me more', 'Give me an example', 'What should I learn next?'] }
    } catch {
      return getMockMentorResponse(message)
    }
  },

  async generateMockHackathon(domain: string, difficulty: string, duration: string): Promise<MockHackathonChallenge> {
    try {
      const prompt = `Generate a ${difficulty} level hackathon challenge in the ${domain} domain for a ${duration} hackathon. Return JSON with: title, problemStatement, requirements (array), constraints (array), evaluationCriteria (array), techSuggestions (array).`
      const response = await callOpenAI([{ role: 'system', content: 'You are a hackathon challenge designer. Return valid JSON only.' }, { role: 'user', content: prompt }])
      return JSON.parse(response)
    } catch {
      return getMockChallenge(domain, difficulty)
    }
  },

  async evaluateSubmission(projectUrl: string, demoUrl: string, challenge: string): Promise<EvaluationResult> {
    try {
      const prompt = `Evaluate a hackathon submission. Challenge: ${challenge}. GitHub: ${projectUrl}. Demo: ${demoUrl}. Score each category 0-100 and provide feedback. Return JSON with: overallScore, scores (array of {category, score, feedback}), strengths (array), weaknesses (array), improvements (array). Categories: Innovation, UI/UX, Backend, Database, Presentation, Scalability, Problem Solving, Creativity.`
      const response = await callOpenAI([{ role: 'system', content: 'You are a hackathon judge. Return valid JSON only.' }, { role: 'user', content: prompt }])
      return JSON.parse(response)
    } catch {
      return getMockEvaluation()
    }
  },

  async analyzeResume(resumeData: Record<string, string>): Promise<ResumeAnalysis> {
    try {
      const prompt = `Analyze this resume for ATS compatibility: ${JSON.stringify(resumeData)}. Return JSON with: atsScore (0-100), formatScore, keywordScore, contentScore, matchedKeywords (array), missingKeywords (array), suggestions (array), strengths (array), weaknesses (array).`
      const response = await callOpenAI([{ role: 'system', content: 'You are an ATS resume analyzer. Return valid JSON.' }, { role: 'user', content: prompt }])
      return JSON.parse(response)
    } catch {
      return getMockResumeAnalysis()
    }
  },

  async analyzeSkillGap(currentSkills: string[], targetHackathon: string): Promise<SkillGapResult> {
    try {
      const prompt = `Compare skills ${JSON.stringify(currentSkills)} against requirements for "${targetHackathon}" hackathon. Return JSON with: missingSkills (array of {skill, priority, estimatedTime}), strengths (array), weaknesses (array), learningPath (array of {step, topic, duration, resources}), estimatedPrepTime.`
      const response = await callOpenAI([{ role: 'system', content: 'You are a skill assessment AI. Return valid JSON.' }, { role: 'user', content: prompt }])
      return JSON.parse(response)
    } catch {
      return getMockSkillGap(currentSkills)
    }
  },

  async generateProjectIdea(theme: string, tech: string[], difficulty: string, timeframe: string, teamSize: string): Promise<ProjectIdea> {
    try {
      const prompt = `Generate a ${difficulty} project idea. Theme: ${theme}. Tech: ${tech.join(', ')}. Time: ${timeframe}. Team: ${teamSize}. Return JSON with: name, description, architecture, features (array), techStack (array), dbSchema, apiEndpoints (array), folderStructure, deploymentGuide, presentationTips (array).`
      const response = await callOpenAI([{ role: 'system', content: 'You are a project architect. Return valid JSON.' }, { role: 'user', content: prompt }], 2000)
      return JSON.parse(response)
    } catch {
      return getMockProjectIdea(theme)
    }
  },

  async getInterviewQuestion(category: string, difficulty: string): Promise<{ question: string; hints: string[] }> {
    try {
      const prompt = `Generate a ${difficulty} ${category} interview question. Return JSON: { question, hints (array of 3 hints) }.`
      const response = await callOpenAI([{ role: 'system', content: 'You are an interview coach. Return valid JSON.' }, { role: 'user', content: prompt }])
      return JSON.parse(response)
    } catch {
      return getMockInterviewQuestion(category)
    }
  },

  async evaluateInterviewAnswer(question: string, answer: string): Promise<InterviewResult> {
    try {
      const prompt = `Evaluate this interview answer. Q: "${question}" A: "${answer}". Return JSON: { question, userAnswer, feedback, score (0-100), idealAnswer, tips (array) }.`
      const response = await callOpenAI([{ role: 'system', content: 'You are an interview evaluator. Return valid JSON.' }, { role: 'user', content: prompt }])
      return JSON.parse(response)
    } catch {
      return { question, userAnswer: answer, feedback: 'Good attempt! Your answer covers the key points. Consider adding more specific examples and metrics to strengthen your response.', score: 75, idealAnswer: 'An ideal answer would include specific examples, quantifiable results, and demonstrate deep understanding of the concept.', tips: ['Use the STAR method', 'Include specific metrics', 'Show problem-solving approach'] }
    }
  },
}

// ---- Mock Fallback Functions ----

function getMockMentorResponse(message: string): MentorResponse {
  const lower = message.toLowerCase()
  if (lower.includes('prepare') || lower.includes('hackathon')) {
    return {
      message: `## 🚀 Hackathon Preparation Guide\n\nGreat question! Here's a structured approach:\n\n### 1. **Before the Hackathon**\n- Study the theme and problem statements\n- Form a balanced team (frontend, backend, design, pitch)\n- Set up your development environment\n- Research previous winners' projects\n\n### 2. **During the Hackathon**\n- Spend first 2 hours on ideation and planning\n- Build MVP first, then add features\n- Test regularly and prepare demo\n- Practice your pitch\n\n### 3. **Key Skills to Focus On**\n- Quick prototyping with React/Next.js\n- API integration\n- UI/UX design principles\n- Presentation skills\n\n> 💡 **Pro Tip**: The winning factor is usually the pitch, not the code. Make sure your demo is polished!`,
      suggestions: ['What tech stack should I learn?', 'How do I find teammates?', 'Give me a project idea'],
    }
  }
  if (lower.includes('react') || lower.includes('frontend')) {
    return {
      message: `## ⚛️ React Learning Roadmap\n\n### Fundamentals\n1. **JSX & Components** — Functional components, props, children\n2. **State Management** — useState, useReducer\n3. **Effects** — useEffect, cleanup functions\n4. **Context API** — Global state without external libraries\n\n### Intermediate\n5. **Custom Hooks** — Reusable logic extraction\n6. **React Router** — SPA navigation\n7. **Form Handling** — React Hook Form + Zod\n8. **API Integration** — React Query / TanStack Query\n\n### Advanced\n9. **Performance** — memo, useMemo, useCallback\n10. **Suspense & Lazy Loading**\n11. **Server Components** (Next.js)\n12. **Testing** — Jest + React Testing Library\n\n> Start building projects after step 4. The best way to learn is by doing!`,
      suggestions: ['Explain hooks in detail', 'Best React projects for beginners', 'React vs Next.js'],
    }
  }
  if (lower.includes('machine learning') || lower.includes('ai') || lower.includes('ml')) {
    return {
      message: `## 🤖 AI/ML Learning Path\n\n### Foundation (2-4 weeks)\n- **Python** — NumPy, Pandas, Matplotlib\n- **Math** — Linear algebra, probability, calculus basics\n- **Statistics** — Distributions, hypothesis testing\n\n### Core ML (4-6 weeks)\n- **Supervised Learning** — Regression, Classification\n- **Unsupervised Learning** — Clustering, Dimensionality Reduction\n- **Model Evaluation** — Cross-validation, metrics\n- **Scikit-learn** — Practical implementations\n\n### Deep Learning (4-6 weeks)\n- **Neural Networks** — Architecture, backpropagation\n- **CNNs** — Image classification\n- **RNNs/LSTMs** — Sequence data\n- **Transformers** — NLP, attention mechanism\n\n### Modern AI (ongoing)\n- **LLMs** — GPT, fine-tuning, prompt engineering\n- **RAG** — Retrieval Augmented Generation\n- **Agents** — Autonomous AI systems\n\nI recommend starting with Andrew Ng's courses on Coursera!`,
      suggestions: ['Best ML projects for hackathons', 'Explain transformers', 'How to deploy ML models'],
    }
  }
  return {
    message: `## 💬 Let me help you!\n\nI'm your AI hackathon coach. Here's what I can help with:\n\n- 🎯 **Hackathon Preparation** — Strategy, timelines, team building\n- 💻 **Technical Skills** — React, Python, ML, Cloud, and more\n- 📝 **Resume Building** — ATS optimization, content improvement\n- 🏗️ **Project Ideas** — Architecture, tech stack selection\n- 🎤 **Interview Prep** — Technical and behavioral\n- 📊 **Skill Assessment** — Identify gaps and create learning plans\n\nWhat would you like to explore? Ask me anything!`,
    suggestions: ['How should I prepare for my first hackathon?', 'Teach me React', 'Suggest a project idea'],
  }
}

function getMockChallenge(domain: string, difficulty: string): MockHackathonChallenge {
  const challenges: Record<string, MockHackathonChallenge> = {
    'AI / ML': {
      title: 'AI-Powered Smart Campus Assistant',
      problemStatement: `Design and build an AI-powered campus assistant that helps students navigate university life. The system should use NLP to answer questions about courses, events, deadlines, and campus services. Include features for personalized schedule optimization, study group matching, and mental health check-ins using sentiment analysis.`,
      requirements: ['Natural Language Understanding for campus queries', 'Personalized schedule recommendations', 'Study group matching algorithm', 'Sentiment analysis for wellness checks', 'Multi-modal input (text, voice)', 'Dashboard with analytics'],
      constraints: ['Must work offline for basic features', `Response time < 2 seconds`, 'Must handle 100+ concurrent users', 'Data privacy compliant (FERPA)', 'Mobile-responsive design'],
      evaluationCriteria: ['Innovation (20%)', 'Technical Implementation (25%)', 'UI/UX Design (15%)', 'Scalability (15%)', 'Presentation (15%)', 'Impact (10%)'],
      techSuggestions: ['Python/FastAPI', 'React/Next.js', 'OpenAI API / Hugging Face', 'PostgreSQL', 'Redis for caching', 'WebSocket for real-time'],
    },
    default: {
      title: `${difficulty} ${domain} Innovation Challenge`,
      problemStatement: `Build an innovative solution in the ${domain} space that addresses a real-world problem. Your application should demonstrate technical excellence, creative problem-solving, and practical utility. Focus on user experience and scalability.`,
      requirements: ['Core functionality implementation', 'User authentication and authorization', 'Responsive UI design', 'API integration', 'Data persistence', 'Error handling and validation'],
      constraints: ['Must be deployable', 'Clean, documented code', 'Cross-browser compatible', 'Performance optimized', 'Security best practices'],
      evaluationCriteria: ['Innovation (20%)', 'Technical Implementation (25%)', 'UI/UX Design (15%)', 'Scalability (15%)', 'Presentation (15%)', 'Impact (10%)'],
      techSuggestions: ['React/TypeScript', 'Node.js/Express', 'PostgreSQL/MongoDB', 'Docker', 'Cloud deployment'],
    },
  }
  return challenges[domain] || challenges.default
}

function getMockEvaluation(): EvaluationResult {
  return {
    overallScore: 87,
    scores: [
      { category: 'Innovation', score: 92, feedback: 'Highly creative approach with novel AI integration. The concept stands out.' },
      { category: 'UI/UX', score: 88, feedback: 'Clean, modern interface with good responsive design. Consider adding more micro-interactions.' },
      { category: 'Backend', score: 85, feedback: 'Solid API design with proper error handling. Could improve database query optimization.' },
      { category: 'Database', score: 82, feedback: 'Well-structured schema. Consider adding indexes for frequently queried fields.' },
      { category: 'Presentation', score: 90, feedback: 'Clear problem statement and demo. Excellent storytelling.' },
      { category: 'Scalability', score: 84, feedback: 'Good architecture choices. Consider adding caching and load balancing.' },
      { category: 'Problem Solving', score: 89, feedback: 'Addresses real user needs effectively. Solution is practical and impactful.' },
      { category: 'Creativity', score: 86, feedback: 'Unique features that differentiate from competitors. Nice gamification elements.' },
    ],
    strengths: ['Innovative AI integration', 'Clean and intuitive UI', 'Strong problem-solution fit', 'Well-structured codebase', 'Impressive live demo'],
    weaknesses: ['Database queries could be optimized', 'Missing comprehensive error handling in edge cases', 'Limited test coverage'],
    improvements: ['Add unit and integration tests', 'Implement caching layer (Redis)', 'Add rate limiting and security middleware', 'Optimize database with proper indexing', 'Add monitoring and logging'],
  }
}

function getMockResumeAnalysis(): ResumeAnalysis {
  return {
    atsScore: 78,
    formatScore: 85,
    keywordScore: 72,
    contentScore: 80,
    matchedKeywords: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'REST API', 'Agile', 'CI/CD'],
    missingKeywords: ['Docker', 'Kubernetes', 'AWS', 'System Design', 'Testing', 'Performance Optimization', 'Microservices'],
    suggestions: [
      'Add more quantifiable achievements (e.g., "Improved load time by 40%")',
      'Include Docker and cloud experience (AWS/GCP)',
      'Add a "Technical Projects" section with GitHub links',
      'Use action verbs: "Architected", "Optimized", "Implemented"',
      'Include your hackathon wins and participation',
      'Add system design experience if applicable',
    ],
    strengths: ['Strong frontend skills', 'Good project descriptions', 'Clean formatting', 'Relevant experience'],
    weaknesses: ['Missing cloud/DevOps skills', 'No quantified achievements', 'Limited testing mention', 'No system design experience'],
  }
}

function getMockSkillGap(currentSkills: string[]): SkillGapResult {
  const allNeeded = ['React', 'TypeScript', 'Python', 'TensorFlow', 'Docker', 'AWS', 'System Design', 'Git', 'REST APIs', 'PostgreSQL', 'Redis', 'CI/CD']
  const missing = allNeeded.filter(s => !currentSkills.some(cs => cs.toLowerCase() === s.toLowerCase()))
  return {
    missingSkills: missing.map((skill, i) => ({
      skill,
      priority: i < 3 ? 'High' : i < 6 ? 'Medium' : 'Low',
      estimatedTime: i < 3 ? '1-2 weeks' : i < 6 ? '2-3 weeks' : '3-4 weeks',
    })),
    strengths: currentSkills.slice(0, 4),
    weaknesses: missing.slice(0, 3),
    learningPath: [
      { step: 1, topic: missing[0] || 'Advanced React', duration: '1 week', resources: ['Official docs', 'YouTube tutorials', 'Practice projects'] },
      { step: 2, topic: missing[1] || 'System Design', duration: '2 weeks', resources: ['System Design Primer', 'Grokking System Design', 'Mock interviews'] },
      { step: 3, topic: missing[2] || 'Cloud Computing', duration: '2 weeks', resources: ['AWS Free Tier', 'Cloud certifications', 'Deploy projects'] },
      { step: 4, topic: 'Integration & Practice', duration: '1 week', resources: ['Build full-stack project', 'Mock hackathon', 'Code review'] },
    ],
    estimatedPrepTime: '4-6 weeks',
  }
}

function getMockProjectIdea(theme: string): ProjectIdea {
  return {
    name: `${theme} Innovation Platform`,
    description: `An AI-powered platform that addresses challenges in the ${theme} domain. The application uses machine learning for intelligent recommendations, real-time data processing for live insights, and a modern React frontend for seamless user experience.`,
    architecture: `The application follows a microservices architecture:\n- Frontend: React + TypeScript SPA\n- API Gateway: Node.js/Express\n- AI Service: Python/FastAPI with ML models\n- Database: PostgreSQL for structured data, Redis for caching\n- Message Queue: RabbitMQ for async processing\n- Storage: S3-compatible object storage`,
    features: ['User authentication & profiles', 'AI-powered recommendations', 'Real-time dashboard with analytics', 'File upload & processing', 'Notification system', 'Social sharing & collaboration', 'Admin panel with moderation', 'Mobile-responsive design'],
    techStack: ['React 19', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    dbSchema: `Users (id, name, email, role)\nProfiles (id, user_id, bio, skills)\nProjects (id, user_id, title, description)\nAnalytics (id, project_id, metrics)\nNotifications (id, user_id, message, read)`,
    apiEndpoints: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/projects', 'POST /api/projects', 'GET /api/analytics/:id', 'POST /api/ai/recommend', 'GET /api/notifications'],
    folderStructure: `src/\n├── components/\n├── pages/\n├── hooks/\n├── store/\n├── lib/\n├── types/\n└── assets/`,
    deploymentGuide: `1. Set up PostgreSQL database\n2. Configure environment variables\n3. Build Docker containers\n4. Deploy frontend to Vercel\n5. Deploy backend to AWS/Railway\n6. Set up CI/CD with GitHub Actions\n7. Configure domain and SSL`,
    presentationTips: ['Start with the problem statement', 'Show a live demo', 'Highlight technical innovation', 'Present metrics and impact', 'End with future roadmap'],
  }
}

function getMockInterviewQuestion(category: string): { question: string; hints: string[] } {
  const questions: Record<string, { question: string; hints: string[] }> = {
    Technical: {
      question: 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?',
      hints: ['Think about data structure and relationships', 'Consider scalability requirements', 'Compare ACID vs BASE properties'],
    },
    Behavioral: {
      question: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
      hints: ['Use the STAR method (Situation, Task, Action, Result)', 'Focus on what YOU did', 'Show emotional intelligence'],
    },
    Coding: {
      question: 'Given an array of integers, find two numbers that add up to a specific target. What is the most efficient approach?',
      hints: ['Consider using a hash map', 'Think about time vs space complexity', 'Handle edge cases like duplicates'],
    },
    HR: {
      question: 'Where do you see yourself in 5 years? How does this role fit into your career goals?',
      hints: ['Be honest but strategic', 'Show alignment with the company', 'Demonstrate growth mindset'],
    },
  }
  return questions[category] || questions.Technical
}

export default AIEngine
