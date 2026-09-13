/* filepath: components/actions.ts */
"use server";

// All server actions require admin authentication
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";

import { db } from "@/lib/firebase";
import { storage } from "@/lib/storage";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type {
  SiteSettings,
  Post,
  Lead,
  Project,
  Transaction,
  ContentItem,
  ContactSubmission,
  NewsletterSubscriber,
} from "@/types/index";

/* ─────────────── Contact Form ─────────────── */

export async function submitContactForm(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const message = formData.get("message")?.toString().trim();
    const subject = formData.get("subject")?.toString().trim() || "General Inquiry";

    if (!name || name.length < 2) {
      return { success: false, message: "Name is required and must be at least 2 characters." };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "A valid email address is required." };
    }
    if (!message || message.length < 10) {
      return { success: false, message: "Message is required and must be at least 10 characters." };
    }

    await addDoc(collection(db, "contact_submissions"), {
      name,
      email: email.toLowerCase(),
      message,
      subject,
      status: "new",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: "Message sent successfully." };
  } catch (error) {
    console.error("submitContactForm error:", error);
    return { success: false, message: "Failed to send message. Please try again." };
  }
}

/* ─────────────── Newsletter ─────────────── */

export async function subscribeNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, message: "A valid email address is required." };
    }

    const newsletterRef = collection(db, "newsletter");
    const q = query(newsletterRef, where("email", "==", normalizedEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existing = snapshot.docs[0];
      const data = existing.data();
      if (data.status === "subscribed") {
        return { success: false, message: "This email is already subscribed." };
      }
      await updateDoc(doc(db, "newsletter", existing.id), {
        status: "subscribed",
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: "Resubscribed successfully." };
    }

    await addDoc(newsletterRef, {
      email: normalizedEmail,
      status: "subscribed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: "Subscribed successfully." };
  } catch (error) {
    console.error("subscribeNewsletter error:", error);
    return { success: false, message: "Failed to subscribe. Please try again." };
  }
}

/* ─────────────── Page View Tracking ─────────────── */

export async function trackPageView(page: string): Promise<void> {
  try {
    if (!page || typeof page !== "string") return;

    await addDoc(collection(db, "page_views"), {
      page,
      sessionId: "server",
      userAgent: "server",
      referrer: "server",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("trackPageView error:", error);
  }
}

/* ─────────────── Site Settings ─────────────── */

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, "site_settings", "default");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SiteSettings;
    }

    const defaultSettings: Omit<SiteSettings, "id"> = {
      siteName: "My Platform",
      siteDescription: "Premium portfolio and business platform.",
      siteUrl: "https://example.com",
      logo: "",
      favicon: "",
      ogImage: "",
      email: "hello@example.com",
      phone: "",
      address: "",
      socialLinks: {
        twitter: "",
        linkedin: "",
        github: "",
        instagram: "",
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
        defaultDescription: "Premium portfolio and business platform.",
      },
      analytics: {
        googleAnalyticsId: "",
        facebookPixelId: "",
      },
      maintenanceMode: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, "site_settings"), defaultSettings);
    return { id: "default", ...defaultSettings } as SiteSettings;
  } catch (error) {
    console.error("getSiteSettings error:", error);
    throw new Error("Failed to load site settings.");
  }
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>
): Promise<void> {
  try {
    const docRef = doc(db, "site_settings", "default");
    const { id, ...data } = settings;
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("updateSiteSettings error:", error);
    throw new Error("Failed to update site settings.");
  }
}

/* ─────────────── Posts ─────────────── */

export async function getPosts(
  postLimit?: number,
  category?: string
): Promise<Post[]> {
  try {
    const postsRef = collection(db, "posts");
    let q = query(postsRef, orderBy("createdAt", "desc"));

    if (category) {
      q = query(postsRef, where("category", "==", category), orderBy("createdAt", "desc"));
    }

    if (postLimit) {
      q = query(q, limit(postLimit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
  } catch (error) {
    console.error("getPosts error:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Post;
  } catch (error) {
    console.error("getPostBySlug error:", error);
    return null;
  }
}

export async function createPost(post: Omit<Post, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("createPost error:", error);
    throw new Error("Failed to create post.");
  }
}

export async function updatePost(
  id: string,
  post: Partial<Post>
): Promise<void> {
  try {
    const docRef = doc(db, "posts", id);
    await updateDoc(docRef, {
      ...post,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("updatePost error:", error);
    throw new Error("Failed to update post.");
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "posts", id));
  } catch (error) {
    console.error("deletePost error:", error);
    throw new Error("Failed to delete post.");
  }
}

/* ─────────────── Leads ─────────────── */

export async function getLeads(): Promise<Lead[]> {
  try {
    const leadsRef = collection(db, "leads");
    const q = query(leadsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
  } catch (error) {
    console.error("getLeads error:", error);
    return [];
  }
}

export async function createLead(lead: Omit<Lead, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "leads"), {
      ...lead,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("createLead error:", error);
    throw new Error("Failed to create lead.");
  }
}

export async function updateLead(
  id: string,
  lead: Partial<Lead>
): Promise<void> {
  try {
    const docRef = doc(db, "leads", id);
    await updateDoc(docRef, {
      ...lead,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("updateLead error:", error);
    throw new Error("Failed to update lead.");
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "leads", id));
  } catch (error) {
    console.error("deleteLead error:", error);
    throw new Error("Failed to delete lead.");
  }
}

/* ─────────────── Projects ─────────────── */

export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
  } catch (error) {
    console.error("getProjects error:", error);
    return [];
  }
}

export async function createProject(
  project: Omit<Project, "id">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("createProject error:", error);
    throw new Error("Failed to create project.");
  }
}

export async function updateProject(
  id: string,
  project: Partial<Project>
): Promise<void> {
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, {
      ...project,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("updateProject error:", error);
    throw new Error("Failed to update project.");
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "projects", id));
  } catch (error) {
    console.error("deleteProject error:", error);
    throw new Error("Failed to delete project.");
  }
}

/* ─────────────── Transactions ─────────────── */

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction);
  } catch (error) {
    console.error("getTransactions error:", error);
    return [];
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "id">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("createTransaction error:", error);
    throw new Error("Failed to create transaction.");
  }
}

/* ─────────────── Content Calendar ─────────────── */

export async function getContentCalendar(): Promise<ContentItem[]> {
  try {
    const contentRef = collection(db, "content_calendar");
    const q = query(contentRef, orderBy("scheduledDate", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ContentItem);
  } catch (error) {
    console.error("getContentCalendar error:", error);
    return [];
  }
}

export async function createContentItem(
  item: Omit<ContentItem, "id">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "content_calendar"), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("createContentItem error:", error);
    throw new Error("Failed to create content item.");
  }
}

export async function updateContentItem(
  id: string,
  item: Partial<ContentItem>
): Promise<void> {
  try {
    const docRef = doc(db, "content_calendar", id);
    await updateDoc(docRef, {
      ...item,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("updateContentItem error:", error);
    throw new Error("Failed to update content item.");
  }
}

/* ─────────────── Contact Submissions ─────────────── */

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const submissionsRef = collection(db, "contact_submissions");
    const q = query(submissionsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ContactSubmission
    );
  } catch (error) {
    console.error("getContactSubmissions error:", error);
    return [];
  }
}

export async function updateContactStatus(
  id: string,
  status: string
): Promise<void> {
  try {
    const docRef = doc(db, "contact_submissions", id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("updateContactStatus error:", error);
    throw new Error("Failed to update contact status.");
  }
}

/* ─────────────── Newsletter Subscribers ─────────────── */

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const subscribersRef = collection(db, "newsletter");
    const q = query(subscribersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as NewsletterSubscriber
    );
  } catch (error) {
    console.error("getNewsletterSubscribers error:", error);
    return [];
  }
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "newsletter", id));
  } catch (error) {
    console.error("deleteNewsletterSubscriber error:", error);
    throw new Error("Failed to delete subscriber.");
  }
}

/* ─────────────── File Upload ─────────────── */

export async function uploadFile(
  formData: FormData
): Promise<{ url: string; path: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided.");
    }

    const folder = formData.get("folder")?.toString() || "uploads";
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);

    const bytes = await file.arrayBuffer();
    await uploadBytes(storageRef, bytes, {
      contentType: file.type,
    });

    const url = await getDownloadURL(storageRef);
    return { url, path: filePath };
  } catch (error) {
    console.error("uploadFile error:", error);
    throw new Error("Failed to upload file.");
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("deleteFile error:", error);
    throw new Error("Failed to delete file.");
  }
}
