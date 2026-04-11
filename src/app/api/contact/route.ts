// src/app/api/contact/route.ts
// Contact form API endpoint.
//
// ── CURRENT STATE ──────────────────────────────────────────────────────────────
// Email sending is STUBBED: the sendEmail() function logs to console only.
//
// ── TO ENABLE REAL EMAIL (e.g. Nodemailer / Resend / SendGrid) ─────────────────
// 1. Install your mailer:   npm install nodemailer   OR   npm install resend
// 2. Add to .env:
//      EMAIL_HOST=smtp.yourprovider.com
//      EMAIL_PORT=587
//      EMAIL_USER=your@email.com
//      EMAIL_PASS=yourpassword
//      EMAIL_TO=admin@finhealth.app          ← where contact-form emails go
// 3. Replace the body of sendEmail() below with your real transporter.
//    Everything else (validation, response shape) stays the same.
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  email:   z.string().email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ── Email stub — replace body with real mailer when ready ─────────────────────
async function sendEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  // TODO: replace this stub with Nodemailer / Resend / SendGrid
  // Example Nodemailer swap-in:
  //
  // import nodemailer from "nodemailer";
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: Number(process.env.EMAIL_PORT),
  //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  // });
  // await transporter.sendMail({
  //   from:    `"FinHealth AI" <${process.env.EMAIL_USER}>`,
  //   to:      process.env.EMAIL_TO,
  //   replyTo: data.email,
  //   subject: `[Contact Form] ${data.subject}`,
  //   text:    `From: ${data.name} <${data.email}>\n\n${data.message}`,
  // });

  // STUB: just log the payload
  console.log("[Contact Form] New message received:", {
    from:    `${data.name} <${data.email}>`,
    subject: data.subject,
    message: data.message,
    time:    new Date().toISOString(),
  });
}
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message ?? "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    await sendEmail(result.data);

    return NextResponse.json({ success: true, message: "Message received. We'll be in touch soon!" });
  } catch (err) {
    console.error("[Contact API] Error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 });
  }
}
