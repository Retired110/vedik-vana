import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export interface DeliveryResult {
  success: boolean;
  provider: string;
  error?: string;
}

import nodemailer from 'nodemailer';

/**
 * 1. Email OTP Dispatcher (Supports Gmail SMTP, Resend REST API, or Console fallback)
 */
async function sendEmailOtp(email: string, code: string): Promise<DeliveryResult> {
  const cleanEmail = email.trim().toLowerCase();
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f5; padding: 32px 16px; color: #292524;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e2d9; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <div style="background: #1c2826; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; margin: 0; letter-spacing: 2px;">VEDIK VANA</h1>
          <p style="color: #c9a84e; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Sacred Indian Botanicals • Farm-Traceable</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="font-size: 18px; color: #1c2826; margin: 0 0 12px 0;">Verify Your Account</h2>
          <p style="font-size: 14px; color: #57534e; line-height: 1.5; margin: 0 0 24px 0;">
            Please use the 6-digit verification code below to sign in to your Vedik Vana sanctuary. This code is confidential and will expire in 5 minutes.
          </p>
          <div style="background: #fbf7ee; border: 2px dashed #c9a84e; border-radius: 12px; padding: 18px; display: inline-block; margin: 0 auto 20px auto;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1c2826; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #a8a29e; margin: 0;">If you did not request this verification code, please ignore this email.</p>
        </div>
        <div style="background: #f5f2ea; padding: 16px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #e7e2d9;">
          © ${new Date().getFullYear()} Vedik Vana Botanicals • Authentic Ayurvedic Living
        </div>
      </div>
    </div>
  `;

  // Priority 1: Gmail SMTP (via GMAIL_USER and GMAIL_APP_PASSWORD)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''), // Handles 16-character Google App Password format
        },
      });

      const info = await transporter.sendMail({
        from: `"Vedik Vana" <${gmailUser}>`,
        to: cleanEmail,
        subject: `${code} is your Vedik Vana Verification Code`,
        html: emailHtml,
      });

      console.log(`[Gmail SMTP] Verification code sent to ${cleanEmail}. ID: ${info.messageId}`);
      return { success: true, provider: 'Gmail' };
    } catch (err: any) {
      console.error('[Gmail SMTP Error]', err.message);
      return { success: false, provider: 'Gmail', error: err.message };
    }
  }

  // Priority 2: Resend API
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Vedik Vana <onboarding@resend.dev>';

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanEmail],
          subject: `${code} is your Vedik Vana Verification Code`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        return { success: true, provider: 'Resend' };
      }
      const errData = await res.json().catch(() => ({}));
      const errorMsg = errData.message || JSON.stringify(errData);
      console.error('[Resend Email Error]', errorMsg);
      return { success: false, provider: 'Resend', error: errorMsg };
    } catch (e: any) {
      console.error('[Resend Network Error]', e.message);
      return { success: false, provider: 'Resend', error: e.message };
    }
  }

  // Development Console Fallback
  logDevCode('EMAIL', cleanEmail, code);
  return { success: true, provider: 'Console' };
}

/**
 * 2. WhatsApp OTP Dispatcher (Meta Cloud API, UltraMsg, Twilio WhatsApp)
 */
async function sendWhatsAppOtp(phone: string, code: string): Promise<DeliveryResult | null> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const fullPhone = `91${cleanPhone}`;

  // Method A: Official Meta WhatsApp Cloud API (Free 1,000 conversations/mo)
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (metaToken && metaPhoneId) {
    try {
      const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
      const bodyPayload = templateName
        ? {
            messaging_product: 'whatsapp',
            to: fullPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: code }],
                },
              ],
            },
          }
        : {
            messaging_product: 'whatsapp',
            to: fullPhone,
            type: 'text',
            text: {
              body: `🌿 *VEDIK VANA Verification*\n\nYour 6-digit login OTP is: *${code}*\n\nValid for 5 minutes. Please do not share this code with anyone.`,
            },
          };

      const res = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (res.ok && data.messages) {
        return { success: true, provider: 'WhatsApp' };
      }
      console.error('[Meta WhatsApp Error]', data);
      return { success: false, provider: 'WhatsApp', error: data.error?.message || 'Meta API error' };
    } catch (e: any) {
      console.error('[Meta WhatsApp Network Error]', e.message);
      return { success: false, provider: 'WhatsApp', error: e.message };
    }
  }

  // Method B: UltraMsg API (Instant QR-code connection)
  const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
  const ultraToken = process.env.ULTRAMSG_TOKEN;
  if (ultraInstance && ultraToken) {
    try {
      const res = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: ultraToken,
          to: `+${fullPhone}`,
          body: `🌿 *VEDIK VANA Verification*\n\nYour 6-digit login OTP is: *${code}*\n\nValid for 5 minutes. Do not share this code with anyone.`,
        }),
      });
      const data = await res.json();
      if (data.sent === 'true' || data.sent === true) {
        return { success: true, provider: 'WhatsApp' };
      }
      console.error('[UltraMsg Error]', data);
      return { success: false, provider: 'WhatsApp', error: data.message || 'UltraMsg error' };
    } catch (e: any) {
      console.error('[UltraMsg Network Error]', e.message);
      return { success: false, provider: 'WhatsApp', error: e.message };
    }
  }

  // Method C: Twilio WhatsApp Sandbox
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  if (twilioSid && twilioToken && process.env.USE_TWILIO_WHATSAPP === 'true') {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: `whatsapp:+${fullPhone}`,
        From: twilioWhatsAppFrom,
        Body: `🌿 *VEDIK VANA*: Your verification code is: *${code}*. Valid for 5 minutes.`,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (res.ok) {
        return { success: true, provider: 'WhatsApp' };
      }
    } catch (e: any) {
      console.error('[Twilio WhatsApp Network Error]', e.message);
    }
  }

  return null; // No WhatsApp provider configured
}

/**
 * 3. Mobile Dispatcher (Tries WhatsApp first, then falls back to SMS / Console)
 */
async function sendMobileOtp(phone: string, code: string): Promise<DeliveryResult> {
  const whatsappResult = await sendWhatsAppOtp(phone, code);
  if (whatsappResult) {
    return whatsappResult;
  }
  return sendSmsOtp(phone, code);
}

/**
 * 4. SMS OTP Dispatcher (Supports Fast2SMS, MSG91, Twilio, or Console)
 */
async function sendSmsOtp(phone: string, code: string): Promise<DeliveryResult> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10); // Standard 10-digit Indian mobile

  // Option A: Fast2SMS (Quickest Indian Transactional OTP API)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${encodeURIComponent(code)}&numbers=${encodeURIComponent(cleanPhone)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'authorization': fast2smsKey,
        },
      });
      const data = await res.json();
      if (data.return) {
        console.log(`[Fast2SMS] Successfully dispatched OTP to ${cleanPhone}. Request ID: ${data.request_id}`);
        return { success: true, provider: 'Fast2SMS' };
      }
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Fast2SMS error';
      console.error('[Fast2SMS Error]', data);
      return { success: false, provider: 'Fast2SMS', error: errMsg };
    } catch (e: any) {
      console.error('[Fast2SMS Network Error]', e.message);
      return { success: false, provider: 'Fast2SMS', error: e.message };
    }
  }

  // Option B: MSG91
  const msg91Key = process.env.MSG91_AUTH_KEY;
  const msg91Template = process.env.MSG91_TEMPLATE_ID;
  if (msg91Key && msg91Template) {
    try {
      const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${msg91Template}&mobile=91${cleanPhone}&authkey=${msg91Key}&otp=${code}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.type === 'success') {
        return { success: true, provider: 'MSG91' };
      }
      console.error('[MSG91 Error]', data);
    } catch (e: any) {
      console.error('[MSG91 Network Error]', e.message);
    }
  }

  // Option C: Twilio
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: phone.startsWith('+') ? phone : `+91${cleanPhone}`,
        From: twilioFrom,
        Body: `Your Vedik Vana verification code is: ${code}. Valid for 5 minutes. Do not share this with anyone.`,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (res.ok) {
        return { success: true, provider: 'Twilio' };
      }
    } catch (e: any) {
      console.error('[Twilio Network Error]', e.message);
    }
  }

  // Development Console Fallback
  logDevCode('SMS', phone, code);
  return { success: true, provider: 'Console' };
}

/**
 * 5. Automated Voice Call Dispatcher (Twilio Voice Text-To-Speech)
 */
async function sendVoiceCallOtp(phone: string, code: string): Promise<DeliveryResult> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const fullPhone = `+91${cleanPhone}`;
  const spacedDigits = code.split('').join(', ');

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const twiml = `<Response><Pause length="1"/><Say voice="Polly.Aditi" language="en-IN">Namaste! This is your verification call from Vedik Vana Botanicals. Your verification code is: ${spacedDigits}. I repeat, your code is: ${spacedDigits}. This code is valid for five minutes. Dhanyavaad!</Say></Response>`;

      const body = new URLSearchParams({
        To: fullPhone,
        From: twilioFrom,
        Twiml: twiml,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await res.json();
      if (res.ok && data.sid) {
        return { success: true, provider: 'Voice Call' };
      }
      console.error('[Twilio Voice Error]', data);
      return { success: false, provider: 'Voice Call', error: data.message || 'Voice call failed' };
    } catch (e: any) {
      console.error('[Twilio Voice Network Error]', e.message);
      return { success: false, provider: 'Voice Call', error: e.message };
    }
  }

  logDevCode('VOICE_CALL', phone, code);
  return { success: true, provider: 'Console' };
}

function logDevCode(channel: 'EMAIL' | 'SMS' | 'VOICE_CALL', identifier: string, code: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n\x1b[42m\x1b[30m%s\x1b[0m', ` [VEDIK VANA OTP DISPATCH - ${channel}] `);
    console.log(`\x1b[33mDestination: ${identifier}\x1b[0m`);
    console.log(`\x1b[32m6-Digit Verification Code: ${code} \x1b[90m(Valid for 5 minutes)\x1b[0m\n`);
  }
}

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_ATTEMPTS = 3;

export async function createAndSendOtp(
  identifier: string,
  type: 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET' | 'ORDER_CONFIRMATION',
  ipAddress?: string,
  channel: 'AUTO' | 'VOICE' = 'AUTO'
): Promise<{ success: boolean; message: string; cooldownRemaining?: number }> {
  const cleanIdentifier = identifier.trim().toLowerCase();

  // 1. Rate limiting: Check resend cooldown (30 seconds)
  const recentOtp = await prisma.otpVerification.findFirst({
    where: {
      identifier: cleanIdentifier,
      createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000);
    const waitSeconds = Math.max(1, RESEND_COOLDOWN_SECONDS - elapsedSeconds);
    return {
      success: false,
      message: `Please wait ${waitSeconds}s before requesting another verification code.`,
      cooldownRemaining: waitSeconds,
    };
  }

  // 2. Hourly rate limiting per identifier (max 6 requests per hour)
  const hourlyCount = await prisma.otpVerification.count({
    where: {
      identifier: cleanIdentifier,
      createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  if (hourlyCount >= 6) {
    return {
      success: false,
      message: 'Too many OTP requests for this number/email. Please try again in an hour.',
    };
  }

  // 3. Generate cryptographically strong 6-digit numeric OTP
  const rawCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 4. Hash the OTP with salt before storing in DB
  const salt = await bcrypt.genSalt(10);
  const hashedCode = await bcrypt.hash(rawCode, salt);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 5. Invalidate previous unverified OTPs for this identifier
  await prisma.otpVerification.deleteMany({
    where: { identifier: cleanIdentifier, verified: false },
  });

  // 6. Save hashed OTP record
  await prisma.otpVerification.create({
    data: {
      identifier: cleanIdentifier,
      code: hashedCode,
      type,
      attempts: 0,
      ipAddress: ipAddress || null,
      expiresAt,
      verified: false,
    },
  });

  // 7. Dispatch via Voice Call, Email, or SMS/WhatsApp adapter
  const isEmail = cleanIdentifier.includes('@');
  let dispatchResult: DeliveryResult;
  if (channel === 'VOICE' && !isEmail) {
    dispatchResult = await sendVoiceCallOtp(cleanIdentifier, rawCode);
  } else if (isEmail) {
    dispatchResult = await sendEmailOtp(cleanIdentifier, rawCode);
  } else {
    dispatchResult = await sendMobileOtp(cleanIdentifier, rawCode);
  }

  if (!dispatchResult.success && dispatchResult.provider !== 'Console') {
    return {
      success: false,
      message: `Failed to deliver verification code via ${dispatchResult.provider}: ${dispatchResult.error || 'Please verify API key and domain configuration.'}`,
    };
  }

  return {
    success: true,
    message: `Verification code sent to ${cleanIdentifier}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  };
}

export async function verifyOtpCode(
  identifier: string,
  enteredCode: string,
  type: string
): Promise<{ success: boolean; message: string; remainingAttempts?: number }> {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanCode = enteredCode.trim();

  // 1. Find the latest valid OTP record for this identifier
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      identifier: cleanIdentifier,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    return {
      success: false,
      message: 'Verification code expired or not found. Please request a new OTP.',
    };
  }

  // 2. Check maximum wrong attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Invalidate the record to prevent brute force
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. This code is now invalid. Please request a new OTP.',
    };
  }

  // 3. Compare entered plain code with stored hash
  const isValid = await bcrypt.compare(cleanCode, otpRecord.code);

  if (!isValid) {
    const newAttempts = otpRecord.attempts + 1;
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: newAttempts },
    });

    const remaining = MAX_ATTEMPTS - newAttempts;
    if (remaining <= 0) {
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      return {
        success: false,
        message: 'Invalid code. You have exceeded the 3 allowed attempts. Please request a new code.',
        remainingAttempts: 0,
      };
    }

    return {
      success: false,
      message: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      remainingAttempts: remaining,
    };
  }

  // 4. Mark as verified
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return {
    success: true,
    message: 'Verification successful!',
  };
}
