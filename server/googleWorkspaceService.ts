import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export interface SheetRow {
  name: string;
  email: string;
  project: string;
  score: string;
  status: string;
  [key: string]: string;
}

export interface SheetReadResult {
  spreadsheetId: string;
  range: string;
  headers: string[];
  rows: SheetRow[];
  totalRecords: number;
}

export interface GmailSendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  error?: string;
}

export interface GoogleWorkspaceVerifyResult {
  email: string;
  isValidGmail: boolean;
  isWorkspaceDomain: boolean;
  domain: string;
  mxVerified: boolean;
  reason?: string;
}

// 1. Google Workspace Email & Gmail Verifier
export async function verifyGmailWorkspaceAccount(email: string): Promise<GoogleWorkspaceVerifyResult> {
  const cleanEmail = email.trim().toLowerCase();
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return {
      email: cleanEmail,
      isValidGmail: false,
      isWorkspaceDomain: false,
      domain: '',
      mxVerified: false,
      reason: 'Invalid email syntax.'
    };
  }

  const [username, domain] = parts;
  const isStandardGmail = domain === 'gmail.com' || domain === 'googlemail.com';

  if (isStandardGmail) {
    if (username.length < 6 || username.length > 30) {
      return {
        email: cleanEmail,
        isValidGmail: false,
        isWorkspaceDomain: false,
        domain,
        mxVerified: false,
        reason: 'Gmail usernames must be between 6 and 30 characters.'
      };
    }
  }

  // Live Google MX DNS lookup to verify Google Workspace domain status
  let mxVerified = false;
  let isWorkspaceDomain = false;

  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        mxVerified = true;
        isWorkspaceDomain = data.Answer.some((ans: any) =>
          ans.data && ans.data.toLowerCase().includes('google')
        );
      }
    }
  } catch (e) {
    console.warn('[WorkspaceVerifier] MX lookup warning:', e);
  }

  return {
    email: cleanEmail,
    isValidGmail: isStandardGmail || isWorkspaceDomain,
    isWorkspaceDomain: isWorkspaceDomain || isStandardGmail,
    domain,
    mxVerified: mxVerified || isStandardGmail,
  };
}

// 2. Google Sheets Data Reader
export async function readGoogleSheetData(spreadsheetId: string, range = 'Sheet1!A1:Z100'): Promise<SheetReadResult> {
  // Extract spreadsheet ID if full URL is passed
  const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const cleanId = match ? match[1] : spreadsheetId.trim();

  // Try direct Google Sheets API if API key exists
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (googleApiKey) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: googleApiKey });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: cleanId,
        range,
      });

      const values = res.data.values || [];
      if (values.length > 0) {
        const headers = values[0].map((h: any) => String(h).trim());
        const rows: SheetRow[] = values.slice(1).map((row: any[]) => {
          const rowObj: SheetRow = { name: '', email: '', project: '', score: '', status: '' };
          headers.forEach((h: string, idx: number) => {
            const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');
            rowObj[key || h] = row[idx] ? String(row[idx]).trim() : '';
          });
          return rowObj;
        });

        return {
          spreadsheetId: cleanId,
          range,
          headers,
          rows,
          totalRecords: rows.length,
        };
      }
    } catch (err) {
      console.warn('[GoogleSheetsAPI] Direct API call fallback to CSV export URL parser:', err);
    }
  }

  // CSV Export Fallback for publicly shared Google Sheets
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv`;
    const res = await fetch(csvUrl);
    if (!res.ok) {
      throw new Error(`Unable to fetch Google Sheet. Please make sure link sharing is set to 'Anyone with link can view'.`);
    }

    const csvText = await res.text();
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      throw new Error('Google Sheet is empty.');
    }

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const rows: SheetRow[] = lines.slice(1).map((line) => {
      const cells = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      const rowObj: SheetRow = { name: '', email: '', project: '', score: '', status: '' };
      headers.forEach((h, idx) => {
        const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        rowObj[key || h] = cells[idx] || '';
      });
      return rowObj;
    });

    return {
      spreadsheetId: cleanId,
      range: 'CSV_Export',
      headers,
      rows,
      totalRecords: rows.length,
    };
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to read Google Sheet data.');
  }
}

// 3. Gmail Results & Notifications Dispatcher
export async function sendGmailResults(
  recipients: Array<{ email: string; name: string; project?: string; score?: string; status?: string }>,
  subject: string,
  templateBody: string
): Promise<GmailSendResult[]> {
  const results: GmailSendResult[] = [];

  // Transporter configured with Nodemailer / Gmail SMTP
  const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_PASS || '';

  let transporter: nodemailer.Transporter;

  if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    // Ethereal test transport fallback
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  for (const r of recipients) {
    try {
      const customizedBody = templateBody
        .replace(/{{name}}/g, r.name || 'Participant')
        .replace(/{{email}}/g, r.email)
        .replace(/{{project}}/g, r.project || 'Hackathon Submission')
        .replace(/{{score}}/g, r.score || '95/100')
        .replace(/{{status}}/g, r.status || 'Winner');

      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0;">HackVerse AI</h1>
            <p style="color: #94a3b8; font-size: 14px;">Google Workspace Results Dispatch</p>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155;">
            <h3 style="color: #818cf8; margin-top: 0;">Hello ${r.name || 'Participant'},</h3>
            <p style="line-height: 1.6; color: #cbd5e1;">${customizedBody}</p>
            <div style="margin-top: 16px; padding: 12px; background: #0f172a; border-radius: 8px; border-left: 4px solid #6366f1;">
              <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;">Project: <strong style="color: #ffffff;">${r.project || 'N/A'}</strong></p>
              <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;">Evaluation Score: <strong style="color: #34d399;">${r.score || '95/100'}</strong></p>
              <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;">Status: <strong style="color: #f59e0b;">${r.status || 'Qualified'}</strong></p>
            </div>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 20px;">Sent via HackVerse AI & Google Workspace Gmail API</p>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"HackVerse AI Workspace" <${SMTP_USER || 'no-reply@hackverse.ai'}>`,
        to: r.email,
        subject: subject.replace(/{{name}}/g, r.name),
        html,
      });

      results.push({
        success: true,
        recipient: r.email,
        messageId: info.messageId,
      });
    } catch (err: any) {
      results.push({
        success: false,
        recipient: r.email,
        error: err?.message || 'Failed to deliver email.',
      });
    }
  }

  return results;
}
