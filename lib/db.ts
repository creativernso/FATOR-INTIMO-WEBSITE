import { getAdminDb } from './firebase-admin';
import { Post, Product, Testimonial, Lead, GuideConfig } from './types';

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
export const getTestimonials = (): Promise<Testimonial[]> => getCollection<Testimonial>('testimonials');
export const saveTestimonials = (t: Testimonial[]): Promise<void> => replaceCollection('testimonials', t);
export const upsertTestimonial = (t: Testimonial): Promise<void> => upsertDoc('testimonials', t);
export const deleteTestimonial = (id: string): Promise<void> => deleteDoc('testimonials', id);

// Leads
export const getLeads = (): Promise<Lead[]> => getCollection<Lead>('leads');
export const saveLeads = (leads: Lead[]): Promise<void> => replaceCollection('leads', leads);
export const upsertLead = (lead: Lead): Promise<void> => upsertDoc('leads', lead);
export const deleteLead = (id: string): Promise<void> => deleteDoc('leads', id);

// Guide config (single doc with id='main')
export async function getGuideConfig(): Promise<GuideConfig> {
  const doc = await db().collection('guide_config').doc('main').get();
  if (doc.exists) return doc.data() as GuideConfig;
  return defaultGuideConfig();
}
export const saveGuideConfig = async (config: GuideConfig): Promise<void> => {
  await db().collection('guide_config').doc('main').set(config);
};

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
