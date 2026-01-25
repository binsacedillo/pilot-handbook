import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { analyzePayload } from '@/lib/security-monitoring';

// Request size limit: 10KB
const MAX_BODY_SIZE = 10 * 1024;

// Validation schema with length limits
const feedbackSchema = z.object({
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback limited to 1000 characters'),
  email: z.string().email().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Enforce request body size
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Request body too large (max 10KB)' },
        { status: 413 }
      );
    }

    // Rate limit: 5 feedback submissions per IP per hour
    const key = getRateLimitKey(req);
    const result = rateLimit(key, 5, 60 * 60 * 1000);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Too many feedback submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback format', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { feedback, email } = parsed.data;

    // Monitor for suspicious patterns
    const ip = key;
    analyzePayload(feedback, ip, '/api/feedback');

    // Sanitize with DOMPurify (defense in depth)
    const sanitizedFeedback = DOMPurify.sanitize(feedback, { ALLOWED_TAGS: [] });
    const sanitizedEmail = email ? DOMPurify.sanitize(email, { ALLOWED_TAGS: [] }) : 'N/A';

    if (!resend) {
      console.warn('RESEND_API_KEY not configured; skipping email send.');
    } else {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'beansgioacedillo@gmail.com',
        subject: 'New Feedback from Pilot Handbook',
        html: `<p><strong>Feedback:</strong> ${sanitizedFeedback}<br/><strong>Email:</strong> ${sanitizedEmail}</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('payload')) {
      return NextResponse.json(
        { success: false, error: 'Request body too large' },
        { status: 413 }
      );
    }
    console.error('Feedback API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}
