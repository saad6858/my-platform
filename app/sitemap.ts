/* filepath: components/sitemap.ts */
import { MetadataRoute } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { Post } from "@/types/index";

const BASE_URL = "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];

  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("published", "==", true),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);

    postRoutes = posts.map((post) => {
      const lastModified = post.updatedAt
        ? new Date(post.updatedAt)
        : post.createdAt
        ? new Date(post.createdAt)
        : now;

      return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error("sitemap error fetching posts:", error);
  }

  return [...staticRoutes, ...postRoutes];
}
