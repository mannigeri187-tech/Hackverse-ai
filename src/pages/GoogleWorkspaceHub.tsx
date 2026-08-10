import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Mail, ShieldCheck, Send, RefreshCw, CheckCircle2, AlertCircle, Database, Search, ArrowRight, Table } from 'lucide-react';
import {
  readGoogleSheet,
  sendGmailResultsToParticipants,
  verifyGmailWorkspace,
  SheetRow,
  GmailSendResult,
  GoogleWorkspaceVerifyResult
} from '@/services/googleWorkspaceClient';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export default function GoogleWorkspaceHub() {
  const { theme } = useAppStore();
  const isDarkMode = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'sheets' | 'gmail' | 'verify'>('sheets');

  // 1. Google Sheets State
  const [sheetInput, setSheetInput] = useState('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
  const [sheetRange, setSheetRange] = useState('Sheet1!A1:Z100');
  const [isReadingSheet, setIsReadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>(['Name', 'Email', 'Project', 'Score', 'Status']);
  const [rows, setRows] = useState<SheetRow[]>([
    { name: 'Manjunath H Annigeri', email: 'manjunath.annigeri@gmail.com', project: 'HackVerse AI Agent', score: '98/100', status: '1st Prize Winner' },
    { name: 'Student Innovator', email: 'student.hacker@gmail.com', project: 'NeuroCode Assistant', score: '94/100', status: 'Runner Up' },
    { name: 'Dev Lead', email: 'mannigeri187@gmail.com', project: 'Prism Engine', score: '91/100', status: 'Finalist' }
  ]);

  // 2. Gmail Dispatcher State
  const [emailSubject, setEmailSubject] = useState('🎉 HackVerse AI Hackathon Evaluation Results & Certificate for {{name}}');
  const [emailBody, setEmailBody] = useState(
    'Congratulations on participating in the HackVerse AI Hackathon! We are thrilled to inform you about your evaluation scores and official project results.'
  );
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailResults, setGmailResults] = useState<GmailSendResult[] | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  // 3. Workspace Verifier State
  const [verifyInput, setVerifyInput] = useState('manjunath.annigeri@gmail.com');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<GoogleWorkspaceVerifyResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Handlers
  const handleReadSheet = async () => {
    if (!sheetInput.trim()) return;
    setIsReadingSheet(true);
    setSheetError(null);
    try {
      const res = await readGoogleSheet(sheetInput, sheetRange);
      if (res.headers && res.headers.length > 0) setHeaders(res.headers);
      if (res.rows && res.rows.length > 0) setRows(res.rows);
    } catch (err: any) {
      setSheetError(err?.message || 'Failed to read Google Sheet.');
    } finally {
      setIsReadingSheet(false);
    }
  };

  const handleSendGmail = async () => {
    if (rows.length === 0) {
      setGmailError('No recipient rows available. Please load Google Sheets data first.');
      return;
    }
    setIsSendingGmail(true);
    setGmailError(null);
    setGmailResults(null);
    try {
      const recipients = rows.map((r) => ({
        email: r.email || r[Object.keys(r).find((k) => k.includes('email')) || 'email'] || '',
        name: r.name || r[Object.keys(r).find((k) => k.includes('name')) || 'name'] || 'Participant',
        project: r.project || r[Object.keys(r).find((k) => k.includes('project')) || 'project'] || '',
        score: r.score || r[Object.keys(r).find((k) => k.includes('score')) || 'score'] || '',
        status: r.status || r[Object.keys(r).find((k) => k.includes('status')) || 'status'] || '',
      })).filter((r) => r.email.trim().length > 0);

      if (recipients.length === 0) {
        throw new Error('No valid email addresses found in Sheet rows.');
      }

      const res = await sendGmailResultsToParticipants(recipients, emailSubject, emailBody);
      setGmailResults(res.results);
    } catch (err: any) {
      setGmailError(err?.message || 'Failed to send Gmail emails.');
    } finally {
      setIsSendingGmail(false);
    }
  };

  const handleVerifyGmail = async () => {
    if (!verifyInput.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      const res = await verifyGmailWorkspace(verifyInput);
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyError(err?.message || 'Failed to verify Gmail address.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Database className="text-white size-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Google Workspace Integration</h1>
          </div>
          <p className="text-sm text-slate-400">
            Read participant records from Google Sheets, verify Gmail identity accounts, and dispatch results via Gmail.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl">
          <button
            onClick={() => setActiveTab('sheets')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'sheets' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <FileSpreadsheet size={16} />
            <span>1. Read Google Sheets</span>
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'gmail' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <Mail size={16} />
            <span>2. Send via Gmail</span>
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'verify' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <ShieldCheck size={16} />
            <span>3. Verify Gmail</span>
          </button>
        </div>
      </div>

      {/* TAB 1: READ GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={cn("p-6 rounded-3xl border shadow-xl space-y-4", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200")}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-400 size-5" />
              <span>Connect & Import Google Sheets Data</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Google Sheet URL or Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className={cn("w-full p-3.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-950 border-white/10 text-white" : "bg-slate-100 border-slate-300 text-slate-900")}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sheet Range</label>
                <input
                  type="text"
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                  placeholder="Sheet1!A1:Z100"
                  className={cn("w-full p-3.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-950 border-white/10 text-white" : "bg-slate-100 border-slate-300 text-slate-900")}
                />
              </div>
            </div>

            {sheetError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{sheetError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleReadSheet}
                disabled={isReadingSheet}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2"
              >
                {isReadingSheet ? <RefreshCw className="animate-spin size-4" /> : <Table size={18} />}
                <span>Fetch Google Sheet Data</span>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className={cn("p-6 rounded-3xl border shadow-xl space-y-4 overflow-hidden", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200")}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-md text-slate-300">Parsed Spreadsheet Data ({rows.length} Records)</h4>
              <button
                onClick={() => setActiveTab('gmail')}
                className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Proceed to Send Results via Gmail</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={cn("border-b text-xs font-bold uppercase tracking-wider", isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>
                    {headers.map((h, idx) => (
                      <th key={idx} className="p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-500/5 transition-colors">
                      {headers.map((h, hIdx) => {
                        const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return <td key={hIdx} className="p-3 font-medium text-slate-200">{row[key || h] || row[Object.keys(row)[hIdx]] || '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: SEND VIA GMAIL */}
      {activeTab === 'gmail' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={cn("p-6 rounded-3xl border shadow-xl space-y-5", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200")}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Mail className="text-indigo-400 size-5" />
              <span>Dispatch Evaluation Results via Gmail API</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={cn("w-full p-3.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-950 border-white/10 text-white" : "bg-slate-100 border-slate-300 text-slate-900")}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Email Message Body Template (Supports <code className="text-indigo-400 font-mono">{"{{name}}"}</code>, <code className="text-indigo-400 font-mono">{"{{score}}"}</code>, <code className="text-indigo-400 font-mono">{"{{project}}"}</code>)
                </label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className={cn("w-full p-3.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-950 border-white/10 text-white" : "bg-slate-100 border-slate-300 text-slate-900")}
                />
              </div>
            </div>

            {gmailError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{gmailError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Target Recipients: <strong>{rows.length} Participants</strong> from Google Sheet</span>
              <button
                onClick={handleSendGmail}
                disabled={isSendingGmail}
                className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2"
              >
                {isSendingGmail ? <RefreshCw className="animate-spin size-4" /> : <Send size={18} />}
                <span>Send Results via Gmail API</span>
              </button>
            </div>
          </div>

          {/* Results Audit Output */}
          {gmailResults && (
            <div className={cn("p-6 rounded-3xl border shadow-xl space-y-4", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200")}>
              <h4 className="font-bold text-md text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400 size-5" />
                <span>Gmail Dispatch Log & Audit</span>
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gmailResults.map((res, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">{res.recipient}</span>
                    {res.success ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>Delivered</span>
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <AlertCircle size={14} />
                        <span>{res.error || 'Failed'}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: VERIFY GMAIL / WORKSPACE */}
      {activeTab === 'verify' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={cn("p-6 rounded-3xl border shadow-xl space-y-5", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200")}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShieldCheck className="text-purple-400 size-5" />
              <span>Verify Gmail & Google Workspace Accounts</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Enter Gmail Address or Google Workspace Email
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="name@gmail.com or name@rvce.edu.in"
                    className={cn("flex-1 p-3.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-950 border-white/10 text-white" : "bg-slate-100 border-slate-300 text-slate-900")}
                  />
                  <button
                    onClick={handleVerifyGmail}
                    disabled={isVerifying}
                    className="py-3.5 px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2 shrink-0"
                  >
                    {isVerifying ? <RefreshCw className="animate-spin size-4" /> : <Search size={18} />}
                    <span>Verify Account</span>
                  </button>
                </div>
              </div>
            </div>

            {verifyError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifyResult && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-indigo-400 font-bold">{verifyResult.email}</span>
                  {verifyResult.isValidGmail ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>Verified Google Account</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      <span>Unverified Domain</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/10">
                  <div>
                    <span className="text-slate-400 block">Domain:</span>
                    <strong className="text-white">{verifyResult.domain}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Google MX DNS:</span>
                    <strong className={verifyResult.mxVerified ? "text-emerald-400" : "text-amber-400"}>
                      {verifyResult.mxVerified ? "Verified Active" : "Pending"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Google Workspace:</span>
                    <strong className={verifyResult.isWorkspaceDomain ? "text-indigo-400" : "text-slate-400"}>
                      {verifyResult.isWorkspaceDomain ? "Yes (Google Enterprise)" : "Standard Gmail"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
