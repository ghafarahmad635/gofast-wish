// lib/email.ts
import { Resend } from "resend";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is missing. Set it in server environment variables.");
  }
  return new Resend(key);
}
const resend =  getResendClient();

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  react?: React.ReactElement; // 👈 Pass a React component instead of HTML
}

/**
 * Generic reusable email sender using Resend + React templates
 */
export async function sendEmail({ to, subject, text, react }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
     from: "GoFast Wish <noreply@gofastwish.com>",
      to: to,
      subject,
      text,
      react, // 👈 React component rendered automatically by Resend
    });

    if (error) {
      console.error("❌ Email send failed:", error);
      throw new Error(error.message);
    }

    console.log(`📧 Email sent successfully to ${to}`);
    return data;
  } catch (err) {
    console.error("⚠️ sendEmail() error:", err);
    throw err;
  }
}
