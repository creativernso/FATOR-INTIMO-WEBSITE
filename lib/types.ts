export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
}

export interface Product {
  id: string;
  title: string;
  hook: string;
  description: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  checkoutUrl: string;
  featured: boolean;
  category: string;
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  transformation: string;
  rating: number;
  avatar?: string;
  productPurchased?: string;
}

export interface Lead {
  id: string;
  email?: string;
  whatsapp?: string;
  name: string;
  source: string;
  createdAt: string;
}
