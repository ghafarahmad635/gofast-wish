import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

function getResendClient() {
  const key = "re_v6ibrFN3_6s7u4gFrNFuXdMQThsFxwRb7";
  if (!key) {
    throw new Error("RESEND_API_KEY is missing. Set it in server environment variables.");
  }
  return new Resend(key);
}
const resend =  getResendClient();

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "GoFast Wish <onboarding@resend.dev>", // for testing
      to: ["delivered@resend.dev"], // ✅ Resend test inbox
      subject: "Resend Test Email",
      react: EmailTemplate({ title: "Test Email", message: "This is a test email via Resend." }),
    });

    if (error) return Response.json({ error }, { status: 500 });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
