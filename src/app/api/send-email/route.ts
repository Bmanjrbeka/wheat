import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';

const emailService = new EmailService({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER!,
  pass: process.env.SMTP_PASS!,
  from: process.env.FROM_EMAIL!,
  fromName: process.env.FROM_NAME!,
});

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, from, fromName } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Send email using the email service
    const success = await emailService.sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      from: from || emailService.config.from,
      fromName: fromName || emailService.config.fromName,
    });

    if (success) {
      return NextResponse.json(
        { 
          message: 'Email sent successfully',
          to,
          subject 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
