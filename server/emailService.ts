import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@hackverse.ai';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'HackVerse AI Security';

let transporter: nodemailer.Transporter | null = null;
let isEthereal = false;

// Initialize Transporter
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log(`[EMAIL SERVICE] Configured production SMTP transporter via ${SMTP_HOST}`);
  } else {
    // Dynamically create Ethereal SMTP Test Account if no custom SMTP credentials in .env
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      console.log(`[EMAIL SERVICE] Ethereal SMTP Test Server initialized. User: ${testAccount.user}`);
    } catch (e) {
      console.error('[EMAIL SERVICE Error] Failed to initialize Ethereal SMTP:', e);
      // Fallback JSON transport
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  console.log(`[EMAIL SERVICE] Dispatching email to: ${to} (Subject: "${subject}")`);

  try {
    const activeTransporter = await getTransporter();
    const info = await activeTransporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${SMTP_USER || EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL SERVICE Success] Email dispatched to ${to} (Message ID: ${info.messageId})`);

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n======================================================`);
      console.log(`📬 [LIVE TEST EMAIL INBOX LINK]`);
      console.log(`View email sent to "${to}" at:`);
      console.log(`👉 ${previewUrl}`);
      console.log(`======================================================\n`);
    }

    return true;
  } catch (error) {
    console.error(`[EMAIL SERVICE Error] Failed to send email to ${to}:`, error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">HackVerse AI</h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Security & Account Ownership Verification</p>
      </div>

      <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #334155;">
        <h2 style="color: #f1f5f9; font-size: 18px; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Your 6-digit email verification code is below. Enter this code on the verification screen to activate your account:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 10px;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
      </div>

      <div style="text-align: center; color: #64748b; font-size: 12px; line-height: 1.5; border-top: 1px solid #1e293b; padding-top: 16px;">
        <p>If you did not request this code, no action is required. Your email and account remain safe and unverified.</p>
        <p>© 2026 HackVerse AI. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Verify your email address`,
    html,
  });
}
