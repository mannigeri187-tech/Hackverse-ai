import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, User } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';

interface ChatWindowProps {
  channelId: string;
  title: string;
  onClose: () => void;
}

export default function ChatWindow({ channelId, title, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useChat(channelId);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(channelId, content);
    if (success) {
      setContent('');
    }
    setIsSending(false);
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 sm:rounded-2xl overflow-hidden pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shrink-0">
            {getInitials(title)}
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{title}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            const senderName = msg.profiles?.name || msg.profiles?.username || 'Unknown';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                      {msg.profiles?.avatar_url ? (
                        <img src={msg.profiles.avatar_url} alt={senderName} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(senderName)
                      )}
                    </div>
                  )}
                  <div 
                    className={`px-4 py-2 rounded-2xl ${
                      isMe 
                        ? 'bg-primary-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                    }`}
                  >
                    {!isMe && <p className="text-[10px] font-bold text-slate-400 mb-1">{senderName}</p>}
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mx-10">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[44px] bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl p-3 text-sm resize-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className="w-11 h-11 shrink-0 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
          </button>
        </div>
      </form>
    </div>
  );
}
