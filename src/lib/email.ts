// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

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
     from: "GoFast Wish <onboarding@resend.dev>",
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
