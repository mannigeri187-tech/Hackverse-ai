export type MentorMode = 'architect' | 'coach' | 'interviewer' | 'debugger';

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  tokens: number;
  createdAt: string;
  modelUsed?: string;
  latencyMs?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface SystemPromptConfig {
  name: string;
  icon: string;
  systemPrompt: string;
  temperature: number;
  model: string;
  maxTokens: number;
}

export interface DebugMetrics {
  rawPrompt: string;
  messages: Array<{ role: Role; content: string }>;
  payload: Record<string, any>;
  tokenCount: number;
  responseTimeMs: number;
  rawAIResponse: string;
  provider: string;
  retries: number;
}

export interface StreamCallbacks {
  onChunk: (chunkText: string) => void;
  onComplete: (fullText: string, metadata: { provider: string; latencyMs: number; tokens: number }) => void;
  onError: (error: Error) => void;
}
