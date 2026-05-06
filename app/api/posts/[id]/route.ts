import { NextRequest, NextResponse } from 'next/server';
import { getPosts, savePosts } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  posts[idx] = { ...posts[idx], ...body, id };
  savePosts(posts);
  return NextResponse.json(posts[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  savePosts(filtered);
  return NextResponse.json({ success: true });
}
