import { getAdminDb } from './firebase-admin';
import type { Query } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { Post, Product, Testimonial, Lead, Guide, GuideConfig, Comment, CommunityUser, CommunityPost, CommunityComment, CommunityReport, AdminNotification, MarqueePhrase, EmailCampaign, EmailAutomation, ChatSettings, ReviewSettings } from './types';

const db = () => getAdminDb();

async function getCollection<T>(name: string): Promise<T[]> {
  const snap = await db().collection(name).get();
  return snap.docs.map((d) => d.data() as T);
}

async function upsertDoc<T extends { id: string }>(name: string, item: T): Promise<void> {
  await db().collection(name).doc(item.id).set(item);
}

async function deleteDoc(name: string, id: string): Promise<void> {
  await db().collection(name).doc(id).delete();
}

async function replaceCollection<T extends { id: string }>(name: string, items: T[]): Promise<void> {
  const col = db().collection(name);
  const snap = await col.get();
  const existingIds = new Set(snap.docs.map((d) => d.id));
  const newIds = new Set(items.map((i) => i.id));

  const batch = db().batch();
  for (const id of existingIds) {
    if (!newIds.has(id)) batch.delete(col.doc(id));
  }
  for (const item of items) {
    batch.set(col.doc(item.id), item);
  }
  await batch.commit();
}

// Posts
export const getPosts = (): Promise<Post[]> => getCollection<Post>('posts');
export const savePosts = (posts: Post[]): Promise<void> => replaceCollection('posts', posts);
export const upsertPost = (post: Post): Promise<void> => upsertDoc('posts', post);
export const deletePost = (id: string): Promise<void> => deleteDoc('posts', id);

// Products
export const getProducts = (): Promise<Product[]> => getCollection<Product>('products');
export const saveProducts = (products: Product[]): Promise<void> => replaceCollection('products', products);
export const upsertProduct = (product: Product): Promise<void> => upsertDoc('products', product);
export const deleteProduct = (id: string): Promise<void> => deleteDoc('products', id);

// Testimonials
export async function getTestimonials(onlyApproved = false): Promise<Testimonial[]> {
  const all = await getCollection<Testimonial>('testimonials');
  if (!onlyApproved) return all;
  // treat missing status as approved (backward compat with manually added ones)
  return all.filter((t) => !t.status || t.status === 'approved');
}
export const saveTestimonials = (t: Testimonial[]): Promise<void> => replaceCollection('testimonials', t);
export const upsertTestimonial = (t: Testimonial): Promise<void> => upsertDoc('testimonials', t);
export const deleteTestimonial = (id: string): Promise<void> => deleteDoc('testimonials', id);

// Leads
export const getLeads = (): Promise<Lead[]> => getCollection<Lead>('leads');
export const saveLeads = (leads: Lead[]): Promise<void> => replaceCollection('leads', leads);
export const upsertLead = (lead: Lead): Promise<void> => upsertDoc('leads', lead);
export const deleteLead = (id: string): Promise<void> => deleteDoc('leads', id);

export async function markLeadReviewRequestSent(leadId: string): Promise<void> {
  await db().collection('leads').doc(leadId).update({
    reviewRequestSentAt: new Date().toISOString(),
  });
}

// Guide config (single doc with id='main')
export async function getGuideConfig(): Promise<GuideConfig> {
  const doc = await db().collection('guide_config').doc('main').get();
  if (doc.exists) return doc.data() as GuideConfig;
  return defaultGuideConfig();
}
export const saveGuideConfig = async (config: GuideConfig): Promise<void> => {
  await db().collection('guide_config').doc('main').set(config);
};

// Comments
export async function getComments(postSlug?: string): Promise<Comment[]> {
  let query: Query = db().collection('comments');
  if (postSlug) query = query.where('postSlug', '==', postSlug);
  const snap = await query.get();
  return snap.docs.map((d) => d.data() as Comment);
}
export const upsertComment = (c: Comment): Promise<void> => upsertDoc('comments', c);
export const deleteComment = (id: string): Promise<void> => deleteDoc('comments', id);

// Reactions (likes per post)
export async function getLikes(postSlug: string): Promise<number> {
  const doc = await db().collection('reactions').doc(postSlug).get();
  return doc.exists ? (doc.data()?.likes ?? 0) : 0;
}
export async function incrementLike(postSlug: string): Promise<number> {
  const ref = db().collection('reactions').doc(postSlug);
  await ref.set({ likes: (await ref.get()).data()?.likes + 1 || 1 }, { merge: true });
  return (await ref.get()).data()?.likes ?? 1;
}

// ─── Admin Notifications ──────────────────────────────────────────────────────

export async function getAdminNotifications(onlyUnread = false): Promise<AdminNotification[]> {
  const snap = await db().collection('admin_notifications').get();
  let notes = snap.docs.map((d) => d.data() as AdminNotification);
  if (onlyUnread) notes = notes.filter((n) => !n.read);
  return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const upsertAdminNotification = (n: AdminNotification): Promise<void> => upsertDoc('admin_notifications', n);

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  const snap = await db().collection('admin_notifications').get();
  const batch = db().batch();
  for (const doc of snap.docs) {
    if (!ids || ids.includes(doc.id)) {
      batch.update(doc.ref, { read: true });
    }
  }
  await batch.commit();
}

export async function createNotification(
  type: AdminNotification['type'],
  title: string,
  body: string,
  meta?: Record<string, string>
): Promise<void> {
  const { v4: uuid } = await import('uuid');
  await upsertAdminNotification({
    id: uuid(),
    type,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
    meta,
  });
}

// ─── Community ────────────────────────────────────────────────────────────────

export async function getCommunityPosts(filter?: { status?: string; category?: string; featured?: boolean }): Promise<CommunityPost[]> {
  const snap = await db().collection('community_posts').get();
  let posts = snap.docs.map((d) => d.data() as CommunityPost);
  if (filter?.status) posts = posts.filter((p) => p.status === filter.status);
  if (filter?.category) posts = posts.filter((p) => p.category === filter.category);
  if (filter?.featured) posts = posts.filter((p) => !!p.featured);
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCommunityPost(id: string): Promise<CommunityPost | null> {
  const doc = await db().collection('community_posts').doc(id).get();
  return doc.exists ? (doc.data() as CommunityPost) : null;
}

export const upsertCommunityPost = (p: CommunityPost): Promise<void> => upsertDoc('community_posts', p);
export const deleteCommunityPost = (id: string): Promise<void> => deleteDoc('community_posts', id);

export async function getCommunityComments(postId: string): Promise<CommunityComment[]> {
  const snap = await db().collection('community_comments').get();
  return snap.docs
    .map((d) => d.data() as CommunityComment)
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const upsertCommunityComment = (c: CommunityComment): Promise<void> => upsertDoc('community_comments', c);
export const deleteCommunityComment = (id: string): Promise<void> => deleteDoc('community_comments', id);

export async function getCommunityUser(uid: string): Promise<CommunityUser | null> {
  const doc = await db().collection('community_users').doc(uid).get();
  return doc.exists ? (doc.data() as CommunityUser) : null;
}

export async function getAllCommunityUsers(): Promise<CommunityUser[]> {
  const snap = await db().collection('community_users').get();
  return snap.docs.map((d) => d.data() as CommunityUser);
}

export const upsertCommunityUser = async (u: CommunityUser): Promise<void> => {
  await db().collection('community_users').doc(u.uid).set(u);
};

export async function getCommunityReports(status?: string): Promise<CommunityReport[]> {
  const snap = await db().collection('community_reports').get();
  let reports = snap.docs.map((d) => d.data() as CommunityReport);
  if (status) reports = reports.filter((r) => r.status === status);
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const upsertCommunityReport = (r: CommunityReport): Promise<void> => upsertDoc('community_reports', r);

export async function incrementCommunityPostStat(postId: string, field: 'commentCount' | 'reactionCount' | 'viewCount', delta = 1): Promise<void> {
  const ref = db().collection('community_posts').doc(postId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const current = (doc.data()?.[field] ?? 0) as number;
  await ref.update({ [field]: current + delta });
}

export async function getCommunityPostReaction(postId: string, uid: string): Promise<boolean> {
  const doc = await db().collection('community_reactions').doc(`${postId}_${uid}`).get();
  return doc.exists;
}

export async function toggleCommunityPostReaction(postId: string, uid: string): Promise<'added' | 'removed'> {
  const ref = db().collection('community_reactions').doc(`${postId}_${uid}`);
  const doc = await ref.get();
  if (doc.exists) {
    await ref.delete();
    await incrementCommunityPostStat(postId, 'reactionCount', -1);
    return 'removed';
  }
  await ref.set({ postId, uid, createdAt: new Date().toISOString() });
  await incrementCommunityPostStat(postId, 'reactionCount', 1);
  return 'added';
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const DEFAULT_MARQUEE_PHRASES: MarqueePhrase[] = [
  { id: '1', text: 'O amor que você merece começa pelo amor que você dá a si mesmo', order: 1, active: true },
  { id: '2', text: 'Padrões que se repetem são mensagens que ainda não foram lidas', order: 2, active: true },
  { id: '3', text: 'Solidão não é ausência de pessoas — é ausência de conexão real', order: 3, active: true },
  { id: '4', text: 'Atração é química. Amor é escolha. Intimidade é construção.', order: 4, active: true },
  { id: '5', text: 'Cada relacionamento é um espelho da sua relação com você mesmo', order: 5, active: true },
  { id: '6', text: 'A cura começa quando você para de fugir do que sente', order: 6, active: true },
  { id: '7', text: 'Entender o comportamento humano é o maior ato de compaixão', order: 7, active: true },
  { id: '8', text: 'Relações saudáveis começam com conversas honestas consigo mesmo', order: 8, active: true },
];

export async function getMarqueePhrases(): Promise<MarqueePhrase[]> {
  const snap = await db().collection('marquee_phrases').get();
  if (snap.empty) return DEFAULT_MARQUEE_PHRASES;
  return snap.docs
    .map((d) => d.data() as MarqueePhrase)
    .sort((a, b) => a.order - b.order);
}

export const upsertMarqueePhrase = (p: MarqueePhrase): Promise<void> => upsertDoc('marquee_phrases', p);
export const deleteMarqueePhrase = (id: string): Promise<void> => deleteDoc('marquee_phrases', id);

// ─── Guides (multi-guide system) ──────────────────────────────────────────────

export async function getGuides(publishedOnly = false, locale?: string): Promise<Guide[]> {
  const snap = await db().collection('guides').get();
  let guides = snap.docs.map((d) => d.data() as Guide);
  if (publishedOnly) guides = guides.filter((g) => g.published);
  // locale filter: return guides matching locale, or those with no locale set (default PT content)
  if (locale && locale !== 'pt') {
    guides = guides.filter((g) => g.locale === locale || !g.locale);
  }
  return guides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const snap = await db().collection('guides').where('slug', '==', slug).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as Guide;
}

export const upsertGuide = (guide: Guide): Promise<void> => upsertDoc('guides', guide);
export const deleteGuide = (id: string): Promise<void> => deleteDoc('guides', id);

export async function incrementGuideDownloads(id: string): Promise<void> {
  const ref = db().collection('guides').doc(id);
  const doc = await ref.get();
  if (doc.exists) {
    const current = ((doc.data() as Guide).downloadCount) ?? 0;
    await ref.update({ downloadCount: current + 1 });
  }
}

// ─── Guide config (legacy single-guide) ───────────────────────────────────────

function defaultGuideConfig(): GuideConfig {
  return {
    id: 'main',
    title: '7 Erros que Fazem Alguém Perder o Interesse',
    headline: '7 Erros que Fazem',
    headlineAccent: 'Alguém Perder o Interesse',
    description: 'Um guia psicológico profundo sobre os padrões invisíveis que sabotam relacionamentos. Aprenda a identificá-los em você mesmo.',
    bullets: [
      'Os 7 erros psicológicos que destroem o interesse antes mesmo de começar',
      'Como a teoria do apego explica por que você repete os mesmos padrões',
      'O princípio da escassez emocional, aprenda como aplicá-lo de forma autêntica',
      'Por que "dar tudo de si" afasta quem você quer por perto',
      'O mapa mental para identificar apegos disfuncionais em menos de 24h',
      'Estratégias baseadas em neurociência para criar conexões mais profundas',
      'O exercício diário de 5 minutos que transforma sua inteligência emocional',
    ],
    ctaText: 'Quero o Guia Gratuito',
    authorName: 'Rafael Moreira',
    authorRole: 'Especialista em Psicologia das Relações',
    authorQuote: 'Este guia é a síntese do que mais vejo repetido nas pessoas que buscam entender por que seus relacionamentos não funcionam.',
    formTitle: 'Quero o guia gratuito',
    formSubtitle: 'Preencha abaixo e receba acesso imediato.',
    successTitle: 'Acesso confirmado!',
    successMessage: 'O guia foi enviado para o seu e-mail. Enquanto isso, explore nossos artigos.',
    updatedAt: new Date().toISOString(),
  };
}

// ─── Email Campaigns ──────────────────────────────────────────────────────────

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  const snap = await db().collection('emailCampaigns').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as EmailCampaign);
}

export async function upsertEmailCampaign(campaign: EmailCampaign): Promise<void> {
  await db().collection('emailCampaigns').doc(campaign.id).set(campaign);
}

export async function deleteEmailCampaign(id: string): Promise<void> {
  await db().collection('emailCampaigns').doc(id).delete();
}

// ─── Email Automations ────────────────────────────────────────────────────────

export async function getEmailAutomations(): Promise<EmailAutomation[]> {
  const snap = await db().collection('emailAutomations').orderBy('createdAt', 'asc').get();
  return snap.docs.map((d) => d.data() as EmailAutomation);
}

export async function upsertEmailAutomation(automation: EmailAutomation): Promise<void> {
  await db().collection('emailAutomations').doc(automation.id).set(automation);
}

export async function deleteEmailAutomation(id: string): Promise<void> {
  await db().collection('emailAutomations').doc(id).delete();
}

// ─── Chat Settings ────────────────────────────────────────────────────────────

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  welcomeMessage: 'Olá! Recebemos sua mensagem e entraremos em contato em breve. 💬',
  offlineMessage: 'Deixe sua mensagem e responderemos em breve.',
  quickReplies: [],
};

export async function getChatSettings(): Promise<ChatSettings> {
  const snap = await db().collection('chatSettings').doc('default').get();
  if (!snap.exists) return DEFAULT_CHAT_SETTINGS;
  return { ...DEFAULT_CHAT_SETTINGS, ...(snap.data() as ChatSettings) };
}

export async function saveChatSettings(settings: ChatSettings): Promise<void> {
  await db().collection('chatSettings').doc('default').set({ ...settings, updatedAt: new Date().toISOString() });
}

// ─── Page Views ───────────────────────────────────────────────────────────────

export async function incrementPageView(path: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const ref = db().collection('pageviews').doc(today);
  const safePath = path.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 80) || '/';
  const key = `paths.${safePath.replace(/\//g, '__')}`;
  await ref.set(
    { date: today, total: FieldValue.increment(1), [key]: FieldValue.increment(1), updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function getPageViewTotals(days = 30): Promise<{ date: string; total: number }[]> {
  const snap = await db().collection('pageviews').orderBy('date', 'desc').limit(days).get();
  return snap.docs.map((d) => ({ date: d.data().date as string, total: (d.data().total as number) || 0 }));
}

// ─── Review automation settings ───────────────────────────────────────────────

const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  productEnabled: true,
  productDelayDays: 15,
  productSubject: 'Como foi sua experiência com {produto}?',
  productBody: 'Olá {nome},\n\nEspero que {produto} esteja tocando algo dentro de você.\n\nSua avaliação ajuda outras pessoas a encontrarem o caminho que você acabou de começar. Demora menos de um minuto — e faz toda a diferença para a nossa comunidade.',
  guideEnabled: true,
  guideDelayDays: 15,
  guideSubject: 'O guia "{guia}" te ajudou?',
  guideBody: 'Olá {nome},\n\nFaz alguns dias que você baixou o guia {guia}. Como foi a leitura?\n\nSua opinião honesta ajuda outras pessoas a decidirem se vale a pena começar essa jornada — e nos ajuda a entender o que está realmente impactando.',
  ctaLabel: 'Deixar minha avaliação',
};

export async function getReviewSettings(): Promise<ReviewSettings> {
  const snap = await db().collection('reviewSettings').doc('default').get();
  if (!snap.exists) return DEFAULT_REVIEW_SETTINGS;
  return { ...DEFAULT_REVIEW_SETTINGS, ...(snap.data() as ReviewSettings) };
}

export async function saveReviewSettings(settings: ReviewSettings): Promise<void> {
  await db().collection('reviewSettings').doc('default').set({
    ...settings,
    updatedAt: new Date().toISOString(),
  });
}
