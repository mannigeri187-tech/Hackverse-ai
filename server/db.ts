import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  email_verification_token: string | null;
  otp_hash: string | null;
  otp_expires_at: number | null;
  otp_attempt_count: number;
  last_resend_at: number | null;
  password_hash: string;
  phone: string | null;
  phone_verified: boolean;
  provider: 'credentials' | 'google' | 'github';
  role: 'student' | 'organizer' | 'admin';
  status: 'active' | 'pending_verification' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login: string | null;
  reset_password_token?: string | null;
  reset_password_expires?: string | null;
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wivwpljbzvitoovbxhlg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7ydraYdZ2S75l3YLwRq49w_qlPXD5t7';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const DB_FILE_PATH = path.resolve(process.cwd(), 'server_db_users.json');

function loadDatabase(): UserRecord[] {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const users = JSON.parse(content);
    return users.map((u: any) => ({
      ...u,
      otp_hash: u.otp_hash || null,
      otp_expires_at: u.otp_expires_at || null,
      otp_attempt_count: typeof u.otp_attempt_count === 'number' ? u.otp_attempt_count : 0,
      last_resend_at: u.last_resend_at || null,
    }));
  } catch (error) {
    console.error('[Database] Failed to read database file:', error);
    return [];
  }
}

function saveDatabase(users: UserRecord[]): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Database] Failed to write database file:', error);
  }
}

// Asynchronously sync record with Supabase PostgreSQL
async function syncUserToSupabase(user: UserRecord) {
  try {
    const { error } = await supabase.from('users').upsert(
      {
        email: user.email,
        full_name: user.full_name,
        password_hash: user.password_hash,
        email_verified: user.email_verified,
        phone: user.phone,
        provider: user.provider,
        role: user.role,
        status: user.status,
        last_login: user.last_login,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (error) {
      console.warn('[Supabase Sync Warning]:', error.message);
    } else {
      console.log(`[Supabase DB Sync] User ${user.email} synced to Supabase production table.`);
    }
  } catch (e) {
    console.warn('[Supabase Sync Exception]:', e);
  }
}

export const db = {
  findUserByEmail(email: string): UserRecord | undefined {
    const users = loadDatabase();
    const cleanEmail = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === cleanEmail);
  },

  findUserById(id: string): UserRecord | undefined {
    const users = loadDatabase();
    return users.find((u) => u.id === id);
  },

  findUserByVerificationToken(token: string): UserRecord | undefined {
    const users = loadDatabase();
    return users.find((u) => u.email_verification_token === token);
  },

  findUserByResetToken(token: string): UserRecord | undefined {
    const users = loadDatabase();
    return users.find((u) => u.reset_password_token === token);
  },

  createUser(user: UserRecord): UserRecord {
    const users = loadDatabase();
    const cleanEmail = user.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('This email is already registered. Please sign in instead.');
    }
    users.push(user);
    saveDatabase(users);
    syncUserToSupabase(user);
    return user;
  },

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord {
    const users = loadDatabase();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('User record not found.');
    }
    const updatedUser = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    users[index] = updatedUser;
    saveDatabase(users);
    syncUserToSupabase(updatedUser);
    return updatedUser;
  },

  deleteUser(id: string): boolean {
    let users = loadDatabase();
    const initialLength = users.length;
    users = users.filter((u) => u.id !== id);
    if (users.length !== initialLength) {
      saveDatabase(users);
      return true;
    }
    return false;
  },
};
