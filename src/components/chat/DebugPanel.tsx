import React from 'react';
import { X, Code, Terminal, Clock, Cpu, Layers } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';

export const DebugPanel: React.FC = () => {
  const { debugMetrics, showDebugPanel, setShowDebugPanel } = useAIChat();

  if (!showDebugPanel || !debugMetrics) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950 border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between font-mono text-xs text-slate-200 overflow-y-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <h3 className="font-extrabold text-sm text-indigo-400 flex items-center gap-2">
            <Terminal size={16} /> Developer Observability Inspector
          </h3>
          <button onClick={() => setShowDebugPanel(false)} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold block flex items-center gap-1">
              <Cpu size={12} /> Active Provider
            </span>
            <span className="text-emerald-400 font-bold truncate block">{debugMetrics.provider}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold block flex items-center gap-1">
              <Clock size={12} /> Response Latency
            </span>
            <span className="text-purple-400 font-bold block">{debugMetrics.responseTimeMs} ms</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold block flex items-center gap-1">
              <Layers size={12} /> Output Tokens
            </span>
            <span className="text-indigo-400 font-bold block">{debugMetrics.tokenCount} tokens</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold block flex items-center gap-1">
              <Code size={12} /> Retries Count
            </span>
            <span className="text-amber-400 font-bold block">{debugMetrics.retries}</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Raw User Prompt</h4>
          <pre className="bg-slate-900 border border-white/5 p-3 rounded-xl overflow-x-auto text-slate-300 text-[11px]">
            {debugMetrics.rawPrompt}
          </pre>
        </div>

        <div>
          <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Payload Messages Stream ({debugMetrics.messages.length} messages)</h4>
          <div className="bg-slate-900 border border-white/5 p-3 rounded-xl space-y-2 max-h-48 overflow-y-auto">
            {debugMetrics.messages.map((m, idx) => (
              <div key={idx} className="pb-2 border-b border-white/5 last:border-none">
                <span className={`font-bold uppercase text-[10px] ${m.role === 'system' ? 'text-purple-400' : m.role === 'user' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  [{m.role}]
                </span>
                <p className="text-[11px] text-slate-300 truncate">{m.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Raw AI Response Output</h4>
          <pre className="bg-slate-900 border border-white/5 p-3 rounded-xl overflow-x-auto text-emerald-400 text-[11px] max-h-48">
            {debugMetrics.rawAIResponse}
          </pre>
        </div>
      </div>
    </div>
  );
};
