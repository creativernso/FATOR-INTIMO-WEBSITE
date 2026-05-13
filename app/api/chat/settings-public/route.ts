import { NextResponse } from 'next/server';
import { getChatSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Public read-only view of chat settings — returns only the fields the
// visitor widget needs (welcome message + quick replies). Admin-only
// settings stay behind /api/admin/chat/settings.
export async function GET() {
  try {
    const s = await getChatSettings();
    return NextResponse.json({
      welcomeMessage: s.welcomeMessage,
      quickReplies: s.quickReplies,
    });
  } catch {
    return NextResponse.json({ welcomeMessage: '', quickReplies: [] });
  }
}
