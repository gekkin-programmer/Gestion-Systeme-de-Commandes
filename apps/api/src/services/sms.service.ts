import twilio from 'twilio';
import { env } from '../config/env';
import { logger } from '../config/logger';

// Lazily create the Twilio client only if credentials are configured.
// In development without credentials, OTP is logged to console instead.
function getClient() {
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return null;
}

/**
 * Send a 6-digit OTP via SMS.
 * In development (no Twilio creds), the OTP is only logged — no SMS is sent.
 */
export async function sendOtp(to: string, otp: string): Promise<void> {
  const message = `Votre code de vérification est : ${otp}. Valable 10 minutes.`;

  const client = getClient();
  if (!client || !env.TWILIO_PHONE_FROM) {
    // Dev fallback — just log
    logger.info({ to, otp }, '[SMS:DEV] OTP (Twilio not configured)');
    return;
  }

  await client.messages.create({
    body: message,
    from: env.TWILIO_PHONE_FROM,
    to,
  });

  logger.info({ to }, '[SMS] OTP sent via Twilio');
}
