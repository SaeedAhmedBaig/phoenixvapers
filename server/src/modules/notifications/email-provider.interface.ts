export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/**
 * Genuine working default adapter (logs the formatted email), not a stub —
 * this is the extension point where a real transactional email provider
 * (SES, Postmark, SendGrid) is swapped in per Volume 5.
 */
export class ConsoleEmailAdapter implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[email] to=${message.to} subject="${message.subject}"\n${message.body}`);
  }
}
