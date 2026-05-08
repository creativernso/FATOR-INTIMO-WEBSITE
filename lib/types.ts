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

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  slug: string;
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
  benefits?: string[];
  whatYouLearn?: string[];
  forWho?: string[];
  faq?: ProductFAQ[];
  downloadUrl?: string;
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
  guideDownloaded?: boolean;
}

export interface GuideConfig {
  id: string; // always 'main'
  title: string;
  headline: string;
  headlineAccent: string;
  description: string;
  bullets: string[];
  ctaText: string;
  authorName: string;
  authorRole: string;
  authorQuote: string;
  formTitle: string;
  formSubtitle: string;
  successTitle: string;
  successMessage: string;
  guideFilePath?: string; // Firebase Storage path e.g. guide/ebook.pdf
  updatedAt: string;
}
