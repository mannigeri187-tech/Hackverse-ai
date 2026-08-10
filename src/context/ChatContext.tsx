import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, MentorMode, DebugMetrics } from '../types/chat';
import { EnterpriseAIService as AIService } from '../services/aiProviderService';
import { ChatStorageService } from '../services/chatStorageService';
import { generateAutoSummary } from '../utils/tokenManager';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string;
  messages: Message[];
  activeMode: MentorMode;
  isStreaming: boolean;
  streamingChunk: string;
  debugMetrics: DebugMetrics | null;
  showDebugPanel: boolean;
  geminiKey: string;
  openaiKey: string;
  setActiveMode: (mode: MentorMode) => void;
  setActiveConversationId: (id: string) => void;
  setShowDebugPanel: (show: boolean) => void;
  setGeminiKey: (key: string) => void;
  setOpenaiKey: (key: string) => void;
  sendMessage: (text: string) => Promise<void>;
  stopStreaming: () => void;
  startNewConversation: () => void;
  deleteConversation: (id: string) => void;
  runAutomatedTests: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-default');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMode, setActiveMode] = useState<MentorMode>('architect');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingChunk, setStreamingChunk] = useState<string>('');
  const [debugMetrics, setDebugMetrics] = useState<DebugMetrics | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('hv_gemini_api_key') || '');
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem('hv_openai_api_key') || '');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize conversations on mount
  useEffect(() => {
    async function loadData() {
      const convs = await ChatStorageService.getConversations();
      if (convs.length > 0) {
        setConversations(convs);
        setActiveConversationId(convs[0].id);
      } else {
        const defaultConv: Conversation = {
          id: 'conv-default',
          userId: 'user-1',
          title: 'System Architecture Session',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0
        };
        await ChatStorageService.saveConversation(defaultConv);
        setConversations([defaultConv]);
        setActiveConversationId('conv-default');
      }
    }
    loadData();
  }, []);

  // Sync messages when active conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) return;
      const msgs = await ChatStorageService.getMessages(activeConversationId);
      if (msgs.length > 0) {
        setMessages(msgs);
      } else {
        const welcomeMsg: Message = {
          id: `msg-welcome-${Date.now()}`,
          conversationId: activeConversationId,
          role: 'assistant',
          content: `Hello! I am your Enterprise AI Assistant. How can I assist with your software architecture, debugging, or hackathon project today?`,
          tokens: 25,
          createdAt: new Date().toISOString(),
          modelUsed: 'Enterprise Dynamic Engine'
        };
        await ChatStorageService.saveMessages(activeConversationId, [welcomeMsg]);
        setMessages([welcomeMsg]);
      }
    }
    loadMessages();
  }, [activeConversationId]);

  const saveApiKeys = useCallback((gKey: string, oKey: string) => {
    setGeminiKey(gKey);
    setOpenaiKey(oKey);
    if (gKey) localStorage.setItem('hv_gemini_api_key', gKey);
    else localStorage.removeItem('hv_gemini_api_key');
    if (oKey) localStorage.setItem('hv_openai_api_key', oKey);
    else localStorage.removeItem('hv_openai_api_key');
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversationId,
      role: 'user',
      content: text.trim(),
      tokens: Math.ceil(text.length / 4),
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingChunk('');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const activeConv = conversations.find(c => c.id === activeConversationId);

    let accumulatedText = '';

    try {
      const result = await AIService.streamCompletion(
        text,
        updatedMessages,
        activeMode,
        {
          onChunk: (chunk) => {
            accumulatedText += chunk;
            setStreamingChunk(accumulatedText);
          },
          onComplete: (fullText, metadata) => {
            const assistantMessage: Message = {
              id: `msg-${Date.now() + 1}`,
              conversationId: activeConversationId,
              role: 'assistant',
              content: fullText,
              tokens: metadata.tokens,
              createdAt: new Date().toISOString(),
              modelUsed: metadata.provider,
              latencyMs: metadata.latencyMs
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);

            // Update conversation stats
            if (activeConv) {
              const updatedConv: Conversation = {
                ...activeConv,
                title: activeConv.title === 'System Architecture Session' ? text.slice(0, 30) : activeConv.title,
                summary: generateAutoSummary(finalMessages),
                updatedAt: new Date().toISOString(),
                messageCount: finalMessages.length
              };
              ChatStorageService.saveConversation(updatedConv);
              setConversations(prev => prev.map(c => (c.id === updatedConv.id ? updatedConv : c)));
            }

            ChatStorageService.saveMessages(activeConversationId, finalMessages);
          },
          onError: (err) => {
            console.error('[ChatContext] Streaming error:', err);
          }
        },
        {
          geminiKey,
          openaiKey,
          conversationSummary: activeConv?.summary,
          signal: abortController.signal
        }
      );

      setDebugMetrics(result.debugMetrics);
    } catch (err: any) {
      console.error('[ChatContext] Send message failed:', err);
    } finally {
      setIsStreaming(false);
      setStreamingChunk('');
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingChunk('');
    }
  };

  const startNewConversation = async () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      userId: 'user-1',
      title: `Conversation ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0
    };

    await ChatStorageService.saveConversation(newConv);
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newId);
  };

  const deleteConversation = async (id: string) => {
    if (conversations.length <= 1) return;
    await ChatStorageService.deleteConversation(id);
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    setActiveConversationId(remaining[0].id);
  };

  const runAutomatedTests = async () => {
    const testPrompts = [
      'Hello',
      'Explain React',
      'Write Python',
      'Tell Joke',
      'What is AI',
      'What is 5+7',
      'Summarize this conversation'
    ];

    for (const prompt of testPrompts) {
      await sendMessage(prompt);
      await new Promise(r => setTimeout(r, 600));
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        messages,
        activeMode,
        isStreaming,
        streamingChunk,
        debugMetrics,
        showDebugPanel,
        geminiKey,
        openaiKey,
        setActiveMode,
        setActiveConversationId,
        setShowDebugPanel,
        setGeminiKey: (k) => saveApiKeys(k, openaiKey),
        setOpenaiKey: (k) => saveApiKeys(geminiKey, k),
        sendMessage,
        stopStreaming,
        startNewConversation,
        deleteConversation,
        runAutomatedTests
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useEnterpriseChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useEnterpriseChat must be used within a ChatProvider');
  }
  return context;
};
