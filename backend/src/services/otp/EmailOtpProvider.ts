import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { IOtpProvider, OtpPayload } from './IOtpProvider.js';

export class EmailOtpProvider implements IOtpProvider {
  private resendClient: Resend | null = null;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // 1. Prioritize Resend API Key (HTTP REST - never blocked by cloud firewalls or port filters)
    const resendApiKey = process.env.RESEND_API_KEY || (
      process.env.SMTP_USER === 'resend' || process.env.SMTP_PASS?.startsWith('re_')
        ? process.env.SMTP_PASS
        : undefined
    );

    if (resendApiKey) {
      this.resendClient = new Resend(resendApiKey);
      console.log('[ROVIN Email OTP] Resend HTTP API engine initialized.');
    } else {
      // 2. Fallback to standard SMTP (e.g. Gmail App Password, Custom SMTP)
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
        });
        console.log(`[ROVIN Email OTP] SMTP Transporter configured (${host}:${port}).`);
      }
    }
  }

  async sendOtp(payload: OtpPayload): Promise<boolean> {
    const rawFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    // Format valid RFC 2822 sender
    const fromAddress = rawFrom.includes('<') ? rawFrom : `ROVIN Tactical <${rawFrom}>`;

    const actionLabel =
      payload.purpose === 'REGISTER'
        ? 'Account Verification'
        : payload.purpose === 'FORGOT_PASSWORD'
        ? 'Password Reset'
        : 'Security Verification';

    const htmlContent = `
      <div style="background-color: #07070A; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #3A4054; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0E0F14; padding: 24px; border-bottom: 2px solid #FFC837; text-align: center;">
          <h1 style="color: #FFFFFF; font-size: 24px; letter-spacing: 4px; margin: 0; font-weight: 900;">ROVIN</h1>
          <p style="color: #FFC837; font-size: 11px; letter-spacing: 2px; margin: 4px 0 0; text-transform: uppercase;">Precision RC & Tactical Gear</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">${actionLabel}</h2>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.5;">
            Use the 6-digit calibration code below to proceed. This code is active for <strong>5 minutes</strong>.
          </p>
          <div style="margin: 28px 0;">
            <span style="display: inline-block; background-color: #14161F; border: 1px solid #FFC837; color: #FFC837; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; border-radius: 6px; font-family: monospace;">
              ${payload.code}
            </span>
          </div>
          <p style="color: #64748B; font-size: 12px; margin-bottom: 0;">
            If you did not request this security code, please ignore this transmission.
          </p>
        </div>
        <div style="background-color: #040406; padding: 14px; text-align: center; border-top: 1px solid #242836; font-size: 11px; color: #64748B;">
          ROVIN PLATFORM • BANGLADESH HIGH-TORQUE E-COMMERCE
        </div>
      </div>
    `;

    // 1. Try Resend HTTP API
    if (this.resendClient) {
      try {
        const { data, error } = await this.resendClient.emails.send({
          from: fromAddress,
          to: payload.recipient,
          subject: `[ROVIN] ${payload.code} is your ${actionLabel} code`,
          html: htmlContent,
        });

        if (error) {
          console.error('[ROVIN Resend API Error]:', error);
          console.warn(`[ROVIN FALLBACK OTP ALERT] Resend API reported error: ${error.message}. OTP code for ${payload.recipient} is: >>> ${payload.code} <<<`);
          return false;
        }

        console.log(`[ROVIN Email OTP] Successfully dispatched via Resend API to ${payload.recipient}. ID: ${data?.id}`);
        return true;
      } catch (err: any) {
        console.error('[ROVIN Resend API Exception]:', err);
        console.warn(`[ROVIN FALLBACK OTP ALERT] OTP code for ${payload.recipient} is: >>> ${payload.code} <<<`);
        return false;
      }
    }

    // 2. Try SMTP Transporter
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromAddress,
          to: payload.recipient,
          subject: `[ROVIN] ${payload.code} is your ${actionLabel} code`,
          html: htmlContent,
        });
        console.log(`[ROVIN Email OTP] Successfully dispatched via SMTP to ${payload.recipient}`);
        return true;
      } catch (err: any) {
        console.error('[ROVIN SMTP Error]:', err);
        console.warn(`[ROVIN FALLBACK OTP ALERT] SMTP failed: ${err.message}. OTP code for ${payload.recipient} is: >>> ${payload.code} <<<`);
        return false;
      }
    }

    // 3. Fallback when neither is configured
    console.warn('[ROVIN Email OTP] Neither Resend nor SMTP credentials configured. Printing fallback to console:');
    console.warn(`[ROVIN FALLBACK OTP ALERT] OTP code for ${payload.recipient} is: >>> ${payload.code} <<<`);
    return true;
  }
}
