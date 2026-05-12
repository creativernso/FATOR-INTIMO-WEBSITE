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
  // Sales video
  videoUrl?: string;
  // Urgency countdown
  countdownEnabled?: boolean;
  countdownEndsAt?: string;   // ISO date string
  countdownText?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  age?: number;
  headline?: string;
  content: string;
  transformation?: string;
  rating?: number;
  avatar?: string;
  productPurchased?: string;
  socialHandle?: string;
  anonymous?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  submittedAt?: string;
}

export interface Lead {
  id: string;
  email?: string;
  whatsapp?: string;
  name: string;
  source: string;
  guideSlug?: string;
  guideName?: string;
  tags?: string[];
  createdAt: string;
  guideDownloaded?: boolean;
}

export interface Guide {
  id: string;
  slug: string;
  locale?: 'pt' | 'en' | 'fr';
  title: string;
  subtitle?: string;
  description: string;
  emotionalHook?: string;
  bullets?: string[];
  ctaText?: string;
  coverImage?: string;
  pdfPath?: string;
  tags?: string[];
  category?: string;
  featured?: boolean;
  published?: boolean;
  downloadCount?: number;
  formTitle?: string;
  formSubtitle?: string;
  successTitle?: string;
  successMessage?: string;
  authorName?: string;
  authorRole?: string;
  authorQuote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postSlug: string;
  name: string;
  email?: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

// ─── Admin Notifications ──────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  type: 'purchase' | 'guide_download' | 'community_join' | 'community_post' | 'community_report' | 'comment' | 'testimonial';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, string>;
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityUser {
  uid: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'founder';
  joinedAt: string;
  postCount: number;
  banned?: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  category: string;
  tags?: string[];
  images?: string[];
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: 'user' | 'moderator' | 'founder';
  anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  pinned?: boolean;
  createdAt: string;
  updatedAt?: string;
  commentCount: number;
  reactionCount: number;
  viewCount?: number;
  reportCount?: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: 'user' | 'moderator' | 'founder';
  anonymous: boolean;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  reactionCount?: number;
}

export interface CommunityReport {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment';
  reason: string;
  reporterId?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// ─── Email Marketing ─────────────────────────────────────────────────────────

export interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  templateId?: string;
  segment: 'all' | 'email' | 'guide_downloaded' | 'no_purchase';
  status: 'draft' | 'sending' | 'sent' | 'scheduled' | 'failed';
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  trigger: 'signup' | 'guide_download' | 'purchase' | 'inactive_30d' | 'inactive_60d';
  delayDays: number;
  subject: string;
  body: string;
  active: boolean;
  totalSent: number;
  lastRunAt?: string;
  createdAt: string;
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

export interface MarqueePhrase {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

// ─── Guide ─────────────────────────────────────────────────────────────────────

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

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatSettings {
  welcomeMessage: string;
  offlineMessage: string;
  quickReplies: string[];
  updatedAt?: string;
}
