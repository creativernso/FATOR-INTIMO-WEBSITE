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
  guideSlug?: string;         // reviews can target a free guide instead of a paid product
  videoUrl?: string;          // optional video testimonial (YouTube, Vimeo, or direct .mp4/.webm)
  socialHandle?: string;
  anonymous?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  submittedAt?: string;
  // Review-system extras
  email?: string;             // used for verified-purchase lookup, never displayed
  location?: string;          // free text, e.g. "São Paulo, BR"
  photoUrl?: string;          // optional review photo (distinct from avatar)
  verifiedPurchase?: boolean; // matched against orders (for products) or downloads (for guides)
  helpfulCount?: number;      // visitors who clicked "Foi útil"
  adminReply?: {
    text: string;
    repliedAt: string;
  };
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
  reviewRequestSentAt?: string; // when the post-download review email was sent
  unsubscribedAt?: string; // set when the lead clicks "Cancelar inscrição" — excluded from all marketing/automation sends from then on
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  visitorId?: string; // links this lead to the anonymous browser id (fi_visitor_id), so a
                       // later checkout from the same browser can be pre-filled with this email
}

// Review automation + UX settings, stored at reviewSettings/default
export interface ReviewSettings {
  productEnabled: boolean;
  productDelayDays: number;
  productSubject: string;
  productBody: string;        // supports {nome}, {produto}, {link}
  guideEnabled: boolean;
  guideDelayDays: number;
  guideSubject: string;
  guideBody: string;          // supports {nome}, {guia}, {link}
  ctaLabel: string;
  updatedAt?: string;
}

export interface CartRecoverySettings {
  enabled: boolean;
  delayHours: number; // hours after abandonment before the recovery email goes out
  subject: string;    // supports {nome}, {produto}, {link}
  body: string;        // supports {nome}, {produto}, {link}
  ctaLabel: string;
  // Second, more urgent follow-up — only sent after the first one already went out
  secondEnabled: boolean;
  secondDelayHours: number; // hours after the first recovery email was sent
  secondSubject: string;
  secondBody: string;
  secondCtaLabel: string;
  updatedAt?: string;
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
  type: 'purchase' | 'guide_download' | 'community_join' | 'community_post' | 'community_report' | 'comment' | 'testimonial' | 'checkout_abandoned' | 'affiliate_application' | 'youtube_video';
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
  trigger: 'signup' | 'guide_download' | 'purchase' | 'inactive_30d' | 'inactive_60d' | 'youtube_video';
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

// ─── Admin team ───────────────────────────────────────────────────────────────

export type AdminRole = 'owner' | 'editor' | 'support';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  createdBy?: string; // uid of the admin who invited them
}

// ─── Popup ────────────────────────────────────────────────────────────────────

export interface PopupConfig {
  id: string; // always 'main'
  enabled: boolean;

  trigger: 'delay' | 'exit_intent' | 'scroll';
  delaySeconds: number; // used for 'delay', and as the mobile fallback for 'exit_intent'
  scrollPercent: number; // used for 'scroll'

  frequency: 'session' | 'every_visit' | 'days';
  frequencyDays: number; // used when frequency === 'days'

  pageScope: 'all' | 'include' | 'exclude';
  pagePaths: string[]; // path prefixes, used with 'include'/'exclude'

  title: string;
  subtitle: string;
  body: string;
  imageUrl?: string;
  ctaText: string;

  incentiveType: 'guide' | 'discount' | 'newsletter';
  guideSlug?: string; // published guide to deliver, when incentiveType === 'guide'
  discountCode?: string; // when incentiveType === 'discount'
  discountText?: string; // e.g. "10% OFF na primeira compra"

  collectName: boolean;
  contactMethod: 'email' | 'whatsapp' | 'both';

  successTitle: string;
  successMessage: string;

  updatedAt: string;
}

// ─── Affiliate program ──────────────────────────────────────────────────────

export type AffiliateStatus = 'pending' | 'approved' | 'rejected';

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string; // unique, URL-safe referral code (?ref=code)
  dashboardToken: string; // unguessable token for the affiliate's own private stats page
  status: AffiliateStatus;
  commissionRate: number; // percentage of order total, e.g. 20 for 20%
  socialHandle?: string;
  message?: string; // how they plan to promote, from the application form
  pixKey?: string; // for manual payouts
  clicks: number;
  createdAt: string;
  approvedAt?: string;
}

export type AffiliateReferralStatus = 'pending' | 'paid';

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  orderId: string;
  sessionId: string;
  productTitle: string;
  saleAmount: number; // cents
  commissionAmount: number; // cents
  status: AffiliateReferralStatus;
  createdAt: string;
  paidAt?: string;
}
