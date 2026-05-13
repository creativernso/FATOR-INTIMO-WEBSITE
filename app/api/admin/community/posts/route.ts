import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityPosts, upsertCommunityPost, deleteCommunityPost, getCommunityPost, getCommunityUser } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { communityPostApprovedHtml, communityPostApprovedText } from '@/lib/email-template';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const posts = await getCommunityPosts();
  return NextResponse.json(posts);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  const post = await getCommunityPost(id);
  if (!post) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });

  const wasPending = post.status === 'pending';
  const becomesApproved = data.status === 'approved';

  await upsertCommunityPost({ ...post, ...data, id });

  // Notify the author when their post transitions from pending → approved
  if (wasPending && becomesApproved && resend) {
    try {
      const author = await getCommunityUser(post.authorUid);
      if (author?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
        const postUrl = `${baseUrl}/comunidade/${id}`;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: author.email,
          subject: 'Sua publicação foi aprovada!',
          html: communityPostApprovedHtml({ authorName: author.name, postTitle: post.title, postUrl }),
          text: communityPostApprovedText({ authorName: author.name, postTitle: post.title, postUrl }),
        });
      }
    } catch (err) {
      console.error('[community/posts] approval email failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  await deleteCommunityPost(id);
  return NextResponse.json({ ok: true });
}
