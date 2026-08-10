import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Bot, User, Plus, MessageSquare, Sparkles, Menu, X, Code, Terminal,
  Lightbulb, Zap, Trash2, Settings, RefreshCw, Copy, Check, Square, Play, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIChat } from '../hooks/useAIChat';
import { MentorMode } from '../types/chat';
import { DebugPanel } from '../components/chat/DebugPanel';
import { ENTERPRISE_SYSTEM_PROMPTS } from '../prompts/systemPrompts';

const SUGGESTED_PROMPTS = [
  'What is React?',
  'What is Python?',
  'Explain Docker.',
  'How can I win a hackathon?',
  'Create a resume.'
];

export default function AIMentor() {
  const {
    conversations,
    activeConversationId,
    messages,
    activeMode,
    isStreaming,
    streamingChunk,
    showDebugPanel,
    geminiKey,
    openaiKey,
    setActiveMode,
    setActiveConversationId,
    setShowDebugPanel,
    setGeminiKey,
    setOpenaiKey,
    sendMessage,
    stopStreaming,
    startNewConversation,
    deleteConversation,
    runAutomatedTests
  } = useAIChat();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingChunk, isStreaming]);

  const handleSendSubmit = async (textToSend: string = input) => {
    const query = textToSend.trim();
    if (!query || isStreaming) return;
    setInput('');
    await sendMessage(query);
  };

  const handleRunSuite = async () => {
    setIsTesting(true);
    await runAutomatedTests();
    setIsTesting(false);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-indigo-500/20 text-indigo-300 font-mono text-xs rounded px-1.5 py-0.5">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 border border-white/10 p-4 rounded-xl my-3 overflow-x-auto font-mono text-xs text-slate-200"><code>$1</code></pre>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-extrabold text-indigo-400 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold text-purple-400 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-white mt-4 mb-2">$1</h1>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
      .replace(/\n/g, '<br />');
    
    return { __html: html };
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-sans text-slate-900 dark:text-white">
      
      {/* Developer Debug Panel Overlay */}
      <DebugPanel />

      {/* Cloud API Key Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                ⚙️ Live Cloud AI Credentials
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Configure your API keys for Google Gemini or OpenAI. If credentials are empty or out of quota, the app automatically switches to the Enterprise Dynamic Engine!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-3 bg-slate-100 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl text-xs dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-500 uppercase tracking-wider block mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 bg-slate-100 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl text-xs dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Chat Sessions */}
      <div className={cn(
        "fixed md:relative z-20 h-full w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 p-4 flex flex-col justify-between transition-all duration-300",
        sidebarOpen ? "left-0" : "-left-72 md:left-0"
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Conversations
            </h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <button
            onClick={startNewConversation}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={16} /> New Conversation
          </button>

          {/* Session List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl text-xs font-semibold cursor-pointer transition-all group",
                  activeConversationId === c.id
                    ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <span className="truncate max-w-[170px]">{c.title}</span>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
          <button
            onClick={handleRunSuite}
            disabled={isTesting || isStreaming}
            className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-emerald-500/20 disabled:opacity-40"
          >
            <Play size={13} /> {isTesting ? 'Running Test Suite...' : '⚡ Run Verification Tests'}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Settings size={14} className="text-indigo-400" /> API Credentials
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Chat Header */}
        <div className="h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-400 hover:text-white">
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  Enterprise AI Chat
                </h3>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Streaming Active
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={cn(
                "hidden sm:flex px-3 py-1.5 rounded-xl font-bold text-xs items-center gap-1.5 transition-all border",
                showDebugPanel
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-400 border-gray-200 dark:border-white/10 hover:text-white"
              )}
            >
              <Eye size={14} /> Developer Inspector
            </button>

            {/* Mode Switcher */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              {(Object.keys(ENTERPRISE_SYSTEM_PROMPTS) as MentorMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMode(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                    activeMode === m
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span>{ENTERPRISE_SYSTEM_PROMPTS[m].icon}</span>
                  <span>{ENTERPRISE_SYSTEM_PROMPTS[m].name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-4xl",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                m.role === 'user' ? "bg-gradient-to-tr from-purple-500 to-pink-600 text-white" : "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white"
              )}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div className={cn(
                "p-5 rounded-3xl space-y-2 border max-w-2xl text-sm leading-relaxed shadow-md relative group",
                m.role === 'user'
                  ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none"
                  : "bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-gray-200 dark:border-white/10 rounded-tl-none"
              )}>
                {m.role === 'assistant' && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                      <Sparkles size={11} /> {m.modelUsed || 'Enterprise Engine'} {m.latencyMs ? `(${m.latencyMs}ms)` : ''}
                    </span>
                    <button
                      onClick={() => copyToClipboard(m.id, m.content)}
                      className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
                    >
                      {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}

                <div 
                  className="prose dark:prose-invert text-xs md:text-sm max-w-none break-words"
                  dangerouslySetInnerHTML={parseMarkdown(m.content)} 
                />

                <span className="text-[10px] opacity-60 block text-right font-semibold">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Active Streaming Chunk Display */}
          {isStreaming && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 mr-auto items-start max-w-4xl">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot size={18} />
              </div>
              <div className="p-5 rounded-3xl space-y-2 border max-w-2xl text-sm leading-relaxed shadow-md bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-gray-200 dark:border-white/10 rounded-tl-none">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                    <RefreshCw className="animate-spin text-indigo-500" size={11} /> Streaming tokens...
                  </span>
                </div>

                <div 
                  className="prose dark:prose-invert text-xs md:text-sm max-w-none break-words"
                  dangerouslySetInnerHTML={parseMarkdown(streamingChunk || '...')} 
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            {SUGGESTED_PROMPTS.map((sp) => (
              <button
                key={sp}
                onClick={() => handleSendSubmit(sp)}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 hover:border-indigo-500 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-500 whitespace-nowrap shadow-sm transition-all"
              >
                💡 {sp}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendSubmit();
            }}
            className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-gray-200 dark:border-white/10 focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Enterprise AI (${ENTERPRISE_SYSTEM_PROMPTS[activeMode].name}) anything...`}
              className="flex-1 bg-transparent px-3 text-sm text-slate-900 dark:text-white outline-none font-medium placeholder-slate-400"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs"
              >
                <Square size={14} /> Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <Send size={16} />
                <span className="hidden sm:inline text-xs">Send</span>
              </button>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
