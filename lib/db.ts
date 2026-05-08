import { getAdminDb } from './firebase-admin';
import { Post, Product, Testimonial, Lead } from './types';

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
