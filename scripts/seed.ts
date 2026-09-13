/* filepath: components/seed.ts */
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  limit,
} from "firebase/firestore";
import type {
  SiteSettings,
  Lead,
  Project,
  Post,
  Transaction,
  ContentItem,
  PortfolioItem,
} from "@/types/index";

async function collectionHasData(collectionName: string): Promise<boolean> {
  const ref = collection(db, collectionName);
  const q = query(ref, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

const defaultSiteSettings: Omit<SiteSettings, "id"> = {
  siteName: "My Platform",
  siteDescription:
    "A premium portfolio and business platform showcasing cutting-edge web development, design, and consulting services.",
  siteUrl: "https://example.com",
  logo: "",
  favicon: "",
  ogImage: "",
  email: "hello@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Innovation Drive, San Francisco, CA 94105",
  socialLinks: {
    twitter: "https://twitter.com/myplatform",
    linkedin: "https://linkedin.com/company/myplatform",
    github: "https://github.com/myplatform",
    instagram: "https://instagram.com/myplatform",
  },
  sections: {
    hero: true,
    about: true,
    services: true,
    portfolio: true,
    blog: true,
    contact: true,
    testimonials: true,
  },
  seo: {
    titleTemplate: "%s | My Platform",
    defaultTitle: "My Platform",
    defaultDescription:
      "Premium portfolio and business platform built with Next.js and Firebase.",
  },
  analytics: {
    googleAnalyticsId: "",
    facebookPixelId: "",
  },
  maintenanceMode: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

const sampleLeads: Omit<Lead, "id">[] = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@acme.com",
    phone: "+1 (555) 987-6543",
    company: "Acme Corp",
    source: "website",
    status: "new",
    notes: "Interested in web development services for their new product launch.",
    value: 15000,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  },
  {
    name: "Michael Chen",
    email: "m.chen@techstart.io",
    phone: "+1 (555) 234-5678",
    company: "TechStart",
    source: "referral",
    status: "contacted",
    notes: "Looking for a full redesign of their SaaS dashboard.",
    value: 25000,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
  },
  {
    name: "Emily Rodriguez",
    email: "emily@designstudio.co",
    phone: "+1 (555) 876-5432",
    company: "Design Studio Co",
    source: "linkedin",
    status: "qualified",
    notes: "Needs a portfolio site with CMS integration.",
    value: 8000,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
  },
  {
    name: "David Park",
    email: "david@nexgen.dev",
    phone: "+1 (555) 345-6789",
    company: "NexGen Solutions",
    source: "other",
    status: "proposal",
    notes: "Enterprise-level application with real-time features.",
    value: 45000,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
  },
];

const sampleProjects: Omit<Project, "id">[] = [
  {
    title: "E-Commerce Platform",
    description:
      "A full-stack e-commerce solution with real-time inventory, Stripe payments, and admin dashboard built with Next.js and Firebase.",
    status: "completed",
    priority: "high",
    tags: ["Next.js", "Firebase", "Stripe", "Tailwind"],
    startDate: Timestamp.fromDate(new Date("2024-01-15")),
    endDate: Timestamp.fromDate(new Date("2024-04-20")),
    budget: 35000,
    clientName: "RetailMax",
    coverImage: "",
    githubUrl: "https://github.com/example/ecommerce",
    liveUrl: "https://retailmax-demo.vercel.app",
    tasks: [
      { id: "t1", title: "Design system setup", status: "done" },
      { id: "t2", title: "Product catalog", status: "done" },
      { id: "t3", title: "Checkout flow", status: "done" },
      { id: "t4", title: "Admin dashboard", status: "done" },
    ],
    createdAt: Timestamp.fromDate(new Date("2024-01-10")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-20")),
  },
  {
    title: "SaaS Analytics Dashboard",
    description:
      "Real-time analytics dashboard with customizable widgets, data visualization, and team collaboration features.",
    status: "in-progress",
    priority: "high",
    tags: ["React", "Recharts", "Firebase", "TypeScript"],
    startDate: Timestamp.fromDate(new Date("2024-05-01")),
    budget: 28000,
    clientName: "DataFlow Inc",
    coverImage: "",
    githubUrl: "https://github.com/example/analytics",
    liveUrl: "",
    tasks: [
      { id: "t1", title: "Architecture planning", status: "done" },
      { id: "t2", title: "Auth system", status: "done" },
      { id: "t3", title: "Chart components", status: "in-progress" },
      { id: "t4", title: "Real-time sync", status: "todo" },
      { id: "t5", title: "Export features", status: "todo" },
    ],
    createdAt: Timestamp.fromDate(new Date("2024-04-25")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-15")),
  },
  {
    title: "Mobile App Landing Page",
    description:
      "High-conversion landing page for a fitness tracking mobile app with interactive demos and subscription funnel.",
    status: "planning",
    priority: "medium",
    tags: ["Next.js", "Framer Motion", "Tailwind"],
    startDate: Timestamp.fromDate(new Date("2024-07-01")),
    budget: 12000,
    clientName: "FitTrack",
    coverImage: "",
    githubUrl: "",
    liveUrl: "",
    tasks: [
      { id: "t1", title: "Wireframes", status: "done" },
      { id: "t2", title: "Hero section", status: "todo" },
      { id: "t3", title: "Feature showcase", status: "todo" },
      { id: "t4", title: "Pricing section", status: "todo" },
    ],
    createdAt: Timestamp.fromDate(new Date("2024-06-20")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-20")),
  },
];

const samplePosts: Omit<Post, "id">[] = [
  {
    title: "Building Scalable Next.js Applications with Firebase",
    slug: "building-scalable-nextjs-firebase",
    excerpt:
      "Learn how to architect production-ready Next.js apps using Firebase for authentication, database, and storage.",
    content:
      "# Building Scalable Next.js Applications with Firebase\n\nIn this comprehensive guide, we explore the best practices for building scalable applications using Next.js 14 and Firebase...",
    coverImage: "",
    category: "Development",
    tags: ["Next.js", "Firebase", "TypeScript", "Architecture"],
    author: "Alex Developer",
    authorId: "author-1",
    published: true,
    featured: true,
    views: 1247,
    likes: 89,
    createdAt: Timestamp.fromDate(new Date("2024-03-15")),
    updatedAt: Timestamp.fromDate(new Date("2024-03-20")),
  },
  {
    title: "The Future of Web Design: Trends to Watch in 2024",
    slug: "web-design-trends-2024",
    excerpt:
      "From glassmorphism to AI-assisted design, discover the trends shaping the future of web design.",
    content:
      "# The Future of Web Design\n\nThe web design landscape is evolving rapidly. In this article, we examine the key trends...",
    coverImage: "",
    category: "Design",
    tags: ["Design", "UI/UX", "Trends", "2024"],
    author: "Alex Developer",
    authorId: "author-1",
    published: true,
    featured: false,
    views: 892,
    likes: 56,
    createdAt: Timestamp.fromDate(new Date("2024-04-10")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-12")),
  },
  {
    title: "Mastering TypeScript: Advanced Patterns for Clean Code",
    slug: "mastering-typescript-advanced-patterns",
    excerpt:
      "Deep dive into advanced TypeScript patterns including discriminated unions, branded types, and type-safe APIs.",
    content:
      "# Mastering TypeScript\n\nTypeScript has become the de facto standard for large-scale JavaScript applications...",
    coverImage: "",
    category: "Development",
    tags: ["TypeScript", "JavaScript", "Patterns", "Clean Code"],
    author: "Alex Developer",
    authorId: "author-1",
    published: true,
    featured: true,
    views: 2156,
    likes: 134,
    createdAt: Timestamp.fromDate(new Date("2024-05-05")),
    updatedAt: Timestamp.fromDate(new Date("2024-05-08")),
  },
];

const sampleTransactions: Omit<Transaction, "id">[] = [
  {
    description: "E-Commerce Platform - Milestone 1",
    amount: 10000,
    type: "income",
    category: "Project Payment",
    date: Timestamp.fromDate(new Date("2024-02-01")),
    status: "completed",
    client: "RetailMax",
    projectId: "",
    notes: "Initial deposit for e-commerce platform development.",
    createdAt: Timestamp.fromDate(new Date("2024-02-01")),
    updatedAt: Timestamp.fromDate(new Date("2024-02-01")),
  },
  {
    description: "E-Commerce Platform - Milestone 2",
    amount: 15000,
    type: "income",
    category: "Project Payment",
    date: Timestamp.fromDate(new Date("2024-03-15")),
    status: "completed",
    client: "RetailMax",
    projectId: "",
    notes: "Second milestone payment upon completion of core features.",
    createdAt: Timestamp.fromDate(new Date("2024-03-15")),
    updatedAt: Timestamp.fromDate(new Date("2024-03-15")),
  },
  {
    description: "E-Commerce Platform - Final Payment",
    amount: 10000,
    type: "income",
    category: "Project Payment",
    date: Timestamp.fromDate(new Date("2024-04-20")),
    status: "completed",
    client: "RetailMax",
    projectId: "",
    notes: "Final payment upon project delivery and acceptance.",
    createdAt: Timestamp.fromDate(new Date("2024-04-20")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-20")),
  },
  {
    description: "Figma Pro Subscription",
    amount: 144,
    type: "expense",
    category: "Software",
    date: Timestamp.fromDate(new Date("2024-05-01")),
    status: "completed",
    client: "",
    projectId: "",
    notes: "Annual Figma Pro subscription renewal.",
    createdAt: Timestamp.fromDate(new Date("2024-05-01")),
    updatedAt: Timestamp.fromDate(new Date("2024-05-01")),
  },
  {
    description: "Vercel Hosting - Enterprise Plan",
    amount: 240,
    type: "expense",
    category: "Hosting",
    date: Timestamp.fromDate(new Date("2024-05-01")),
    status: "completed",
    client: "",
    projectId: "",
    notes: "Monthly Vercel enterprise hosting plan.",
    createdAt: Timestamp.fromDate(new Date("2024-05-01")),
    updatedAt: Timestamp.fromDate(new Date("2024-05-01")),
  },
];

const sampleContentItems: Omit<ContentItem, "id">[] = [
  {
    title: "Next.js 14 App Router Deep Dive",
    type: "blog",
    status: "published",
    scheduledDate: Timestamp.fromDate(new Date("2024-06-01")),
    platform: "Blog",
    description: "Comprehensive tutorial on Next.js 14 App Router with server components.",
    tags: ["Next.js", "Tutorial", "React"],
    createdAt: Timestamp.fromDate(new Date("2024-05-20")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-01")),
  },
  {
    title: "Design System Launch Announcement",
    type: "social",
    status: "scheduled",
    scheduledDate: Timestamp.fromDate(new Date("2024-06-15")),
    platform: "Twitter",
    description: "Announcing our new design system with interactive components.",
    tags: ["Design", "Announcement"],
    createdAt: Timestamp.fromDate(new Date("2024-06-05")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-05")),
  },
  {
    title: "Q2 Performance Review Video",
    type: "video",
    status: "draft",
    scheduledDate: Timestamp.fromDate(new Date("2024-06-30")),
    platform: "YouTube",
    description: "Quarterly performance review and upcoming project roadmap.",
    tags: ["Review", "Roadmap", "Q2"],
    createdAt: Timestamp.fromDate(new Date("2024-06-10")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-10")),
  },
];

const samplePortfolioItems: Omit<PortfolioItem, "id">[] = [
  {
    title: "FinTech Dashboard",
    description:
      "A comprehensive financial analytics dashboard featuring real-time data visualization, portfolio tracking, and predictive analytics.",
    category: "Web Application",
    tags: ["Next.js", "Firebase", "Recharts", "TypeScript"],
    coverImage: "",
    images: [],
    liveUrl: "https://fintech-demo.vercel.app",
    githubUrl: "https://github.com/example/fintech",
    featured: true,
    order: 1,
    createdAt: Timestamp.fromDate(new Date("2024-01-20")),
    updatedAt: Timestamp.fromDate(new Date("2024-01-20")),
  },
  {
    title: "Health & Wellness App",
    description:
      "A mobile-first wellness platform with workout tracking, nutrition logging, and personalized health insights.",
    category: "Mobile App",
    tags: ["React Native", "Firebase", "HealthKit", "Expo"],
    coverImage: "",
    images: [],
    liveUrl: "",
    githubUrl: "https://github.com/example/wellness",
    featured: true,
    order: 2,
    createdAt: Timestamp.fromDate(new Date("2024-02-15")),
    updatedAt: Timestamp.fromDate(new Date("2024-02-15")),
  },
  {
    title: "Creative Agency Website",
    description:
      "An award-winning creative agency website with immersive animations, WebGL effects, and a custom CMS.",
    category: "Website",
    tags: ["Next.js", "Framer Motion", "Three.js", "Sanity"],
    coverImage: "",
    images: [],
    liveUrl: "https://creative-agency-demo.vercel.app",
    githubUrl: "",
    featured: false,
    order: 3,
    createdAt: Timestamp.fromDate(new Date("2024-03-10")),
    updatedAt: Timestamp.fromDate(new Date("2024-03-10")),
  },
];

export interface SeedResult {
  collection: string;
  created: number;
  skipped: boolean;
}

export async function seedDatabase(): Promise<SeedResult[]> {
  const results: SeedResult[] = [];

  // Site Settings
  const hasSettings = await collectionHasData("site_settings");
  if (!hasSettings) {
    await addDoc(collection(db, "site_settings"), {
      ...defaultSiteSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    results.push({ collection: "site_settings", created: 1, skipped: false });
  } else {
    results.push({ collection: "site_settings", created: 0, skipped: true });
  }

  // Leads
  const hasLeads = await collectionHasData("leads");
  if (!hasLeads) {
    for (const lead of sampleLeads) {
      await addDoc(collection(db, "leads"), {
        ...lead,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    results.push({ collection: "leads", created: sampleLeads.length, skipped: false });
  } else {
    results.push({ collection: "leads", created: 0, skipped: true });
  }

  // Projects
  const hasProjects = await collectionHasData("projects");
  if (!hasProjects) {
    for (const project of sampleProjects) {
      await addDoc(collection(db, "projects"), {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    results.push({
      collection: "projects",
      created: sampleProjects.length,
      skipped: false,
    });
  } else {
    results.push({ collection: "projects", created: 0, skipped: true });
  }

  // Posts
  const hasPosts = await collectionHasData("posts");
  if (!hasPosts) {
    for (const post of samplePosts) {
      await addDoc(collection(db, "posts"), {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    results.push({ collection: "posts", created: samplePosts.length, skipped: false });
  } else {
    results.push({ collection: "posts", created: 0, skipped: true });
  }

  // Transactions
  const hasTransactions = await collectionHasData("transactions");
  if (!hasTransactions) {
    for (const transaction of sampleTransactions) {
      await addDoc(collection(db, "transactions"), {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    results.push({
      collection: "transactions",
      created: sampleTransactions.length,
      skipped: false,
    });
  } else {
    results.push({ collection: "transactions", created: 0, skipped: true });
  }

  // Content Calendar
  const hasContent = await collectionHasData("content_calendar");
  if (!hasContent) {
    for (const item of sampleContentItems) {
      await addDoc(collection(db, "content_calendar"), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    results.push({
      collection: "content_calendar",
      created: sampleContentItems.length,
      skipped: false,
    });
  } else {
    results.push({ collection: "content_calendar", created: 0, skipped: true });
  }

  // Portfolio Items
  const hasPortfolio = await collectionHasData("portfolio");
  if (!hasPortfolio) {
    for (const item of samplePortfolioItems) {
      await addDoc(collection(db, "portfolio"), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    results.push({
      collection: "portfolio",
      created: samplePortfolioItems.length,
      skipped: false,
    });
  } else {
    results.push({ collection: "portfolio", created: 0, skipped: true });
  }

  return results;
}
