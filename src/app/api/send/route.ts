import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY!);

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
