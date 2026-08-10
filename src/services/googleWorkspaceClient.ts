const BASE_URL = 'http://localhost:4000/api/google-workspace';

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

export async function verifyGmailWorkspace(email: string): Promise<GoogleWorkspaceVerifyResult> {
  const res = await fetch(`${BASE_URL}/verify-gmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to verify Gmail Workspace account.');
  }
  return res.json();
}

export async function readGoogleSheet(spreadsheetId: string, range?: string): Promise<SheetReadResult> {
  const res = await fetch(`${BASE_URL}/read-sheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spreadsheetId, range }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to read Google Sheet.');
  }
  return res.json();
}

export async function sendGmailResultsToParticipants(
  recipients: Array<{ email: string; name: string; project?: string; score?: string; status?: string }>,
  subject: string,
  body: string
): Promise<{ message: string; results: GmailSendResult[] }> {
  const res = await fetch(`${BASE_URL}/send-gmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipients, subject, body }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to dispatch Gmail emails.');
  }
  return res.json();
}
