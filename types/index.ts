import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "admin" | "visitor";
  createdAt: Date;
}

export interface BrandSettings {
  name: string;
  tagline?: string;
  logo?: string;
}

export interface SiteSettings {
  id: string;
  brand: BrandSettings;
  sections: {
    hero: boolean;
    about: boolean;
    services: boolean;
    portfolio: boolean;
    blog: boolean;
    contact: boolean;
    testimonials: boolean;
    faq: boolean;
    cta: boolean;
    pricing: boolean;
    process: boolean;
    stats: boolean;
  };
  appearance: {
    accentColor: string;
    fontFamily: string;
    enableCustomCursor: boolean;
    enableParticles: boolean;
    enableAurora: boolean;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
    bgColor: string;
    textColor: string;
    borderColor?: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
    keywords: string;
    canonical?: string;
  };
  pricing: {
    baseRate: number;
    perPicRate: number;
    currency: string;
  };
  contact: {
    whatsapp: string;
    email: string;
    location: string;
    linkedin: string;
    github: string;
  };
  updatedAt: Date;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt: Date | null;
  scheduledAt: Date | null;
  author: string;
  readTime: number;
  views: number;
  likes: number;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  agency: string;
  phone: string;
  email: string;
  source: "zameen" | "facebook" | "instagram" | "referral" | "website" | "linkedin" | "other";
  status: "new" | "contacted" | "replied" | "sample_sent" | "negotiating" | "converted" | "lost" | "follow_up";
  dateContacted: Date;
  dateFollowUp: Date;
  notes: string;
  messages: Array<{
    id: string;
    content: string;
    type: "inbound" | "outbound";
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  status: "pending" | "in_progress" | "review" | "delivered" | "paid" | "cancelled";
  dateStarted: Date;
  dateDue: Date;
  budget: number;
  clips: ProjectClip[];
  statusHistory?: Array<{
    status: string;
    timestamp: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectClip {
  id: string;
  name: string;
  photoUsed: string;
  preset: string;
  status: "pending" | "generated" | "in_progress" | "review" | "approved";
  url: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "complete" | "in_progress" | "planned";
  image: string;
  media?: string[];
  beforeImage?: string;
  afterImage?: string;
  tech: string[];
  link: string;
  github: string;
  date: Date;
  location?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  client?: string;
  project?: string;
  date: Date;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "social" | "blog" | "video" | "email";
  platform: "facebook" | "instagram" | "linkedin" | "twitter" | "youtube" | "email";
  status: "draft" | "scheduled" | "published";
  scheduledAt: Date | null;
  publishedAt: Date | null;
  url?: string;
  engagement?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status: "new" | "replied" | "closed";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  status: "active" | "unsubscribed";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document" | "other";
  size: number;
  path: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface PageView {
  id: string;
  path: string;
  sessionId: string;
  device: string;
  referrer?: string;
  timestamp: Date;
}
