import { Message } from '../types/chat';

// Simple heuristic token counter: ~4 characters per token
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateMessagesTokens(messages: Array<{ role: string; content: string }>): number {
  return messages.reduce((acc, m) => acc + estimateTokens(m.content) + 4, 0);
}

export interface PreparedContext {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  tokenCount: number;
  isTruncated: boolean;
  summaryUsed?: string;
}

const MAX_CONTEXT_TOKENS = 6000;

export function prepareConversationPayload(
  systemPrompt: string,
  history: Message[],
  latestUserMessage: string,
  existingSummary?: string
): PreparedContext {
  const latestMessageTokens = estimateTokens(latestUserMessage);
  const systemPromptTokens = estimateTokens(systemPrompt);
  
  let availableTokens = MAX_CONTEXT_TOKENS - systemPromptTokens - latestMessageTokens - 100;
  
  const formattedHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  
  let summaryText = existingSummary || '';
  
  // Include existing summary if available
  if (summaryText) {
    formattedHistory.push({
      role: 'system',
      content: `[Previous Conversation Summary]: ${summaryText}`
    });
    availableTokens -= estimateTokens(summaryText);
  }

  // Iterate backwards from most recent messages
  const reversedHistory = [...history].reverse();
  const selectedHistory: Message[] = [];
  let accumulatedTokens = 0;
  let isTruncated = false;

  for (const msg of reversedHistory) {
    const msgTokens = estimateTokens(msg.content);
    if (accumulatedTokens + msgTokens <= availableTokens) {
      selectedHistory.unshift(msg);
      accumulatedTokens += msgTokens;
    } else {
      isTruncated = true;
      break;
    }
  }

  // Combine system prompt + history + latest message
  const finalMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    ...selectedHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user', content: latestUserMessage }
  ];

  const totalTokens = estimateMessagesTokens(finalMessages);

  return {
    messages: finalMessages,
    tokenCount: totalTokens,
    isTruncated,
    summaryUsed: summaryText
  };
}

export function generateAutoSummary(history: Message[]): string {
  if (history.length < 4) return '';
  const keyTopics = history
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content.slice(0, 60))
    .join('; ');
  return `User discussed: ${keyTopics}`;
}
