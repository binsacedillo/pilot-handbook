import { NextRequest, NextResponse } from 'next/server';

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { feedback, email } = await req.json();
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'beansgioacedillo@gmail.com',
      subject: 'New Feedback from Pilot Handbook',
      html: `<p><strong>Feedback:</strong> ${feedback}<br/><strong>Email:</strong> ${email || 'N/A'}</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
