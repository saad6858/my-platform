/* filepath: components/seo.ts */
import type { Metadata } from "next";
import type { SiteSettings, Post } from "@/types/index";

export const defaultMeta: Metadata = {
  title: {
    default: "My Platform",
    template: "%s | My Platform",
  },
  description: "Premium portfolio and business platform built with Next.js.",
  keywords: [
    "portfolio",
    "business",
    "web development",
    "design",
    "consulting",
  ],
  authors: [{ name: "My Platform" }],
  creator: "My Platform",
  publisher: "My Platform",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "My Platform",
    title: "My Platform",
    description: "Premium portfolio and business platform built with Next.js.",
    url: "https://example.com",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Platform",
    description: "Premium portfolio and business platform built with Next.js.",
    images: ["https://example.com/og-image.png"],
    creator: "@myplatform",
  },
  alternates: {
    canonical: "https://example.com",
  },
  metadataBase: new URL("https://example.com"),
};

export function generateMetaTags(
  settings: SiteSettings,
  page?: string
): Metadata {
  const siteName = settings.siteName || "My Platform";
  const siteUrl = settings.siteUrl || "https://example.com";
  const description = settings.siteDescription || defaultMeta.description || "";
  const ogImage = settings.ogImage || `${siteUrl}/api/og?title=${encodeURIComponent(siteName)}`;

  const title = page ? `${page} | ${siteName}` : siteName;
  const titleTemplate = settings.seo?.titleTemplate || "%s | My Platform";
  const resolvedTitle = page
    ? titleTemplate.replace("%s", page)
    : settings.seo?.defaultTitle || siteName;

  return {
    title: resolvedTitle,
    description,
    keywords: [
      "portfolio",
      "business",
      "web development",
      "design",
      "consulting",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title: resolvedTitle,
      description,
      url: siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImage],
      creator: settings.socialLinks?.twitter
        ? `@${settings.socialLinks.twitter.replace(/^@/, "")}`
        : "@myplatform",
    },
    alternates: {
      canonical: siteUrl,
    },
    metadataBase: new URL(siteUrl),
  };
}

export function generateStructuredData(
  type: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const base = {
    "@context": "https://schema.org",
    "@type": type,
  };

  switch (type) {
    case "WebSite":
      return {
        ...base,
        name: data.name || "My Platform",
        url: data.url || "https://example.com",
        description: data.description || "",
        potentialAction: {
          "@type": "SearchAction",
          target: `${data.url || "https://example.com"}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      };

    case "WebPage":
      return {
        ...base,
        name: data.name || "",
        description: data.description || "",
        url: data.url || "",
        isPartOf: {
          "@type": "WebSite",
          name: data.siteName || "My Platform",
          url: data.siteUrl || "https://example.com",
        },
      };

    case "BlogPosting":
      return {
        ...base,
        headline: data.headline || "",
        description: data.description || "",
        image: data.image || "",
        datePublished: data.datePublished || "",
        dateModified: data.dateModified || data.datePublished || "",
        author: {
          "@type": "Person",
          name: data.authorName || "",
        },
        publisher: {
          "@type": "Organization",
          name: data.publisherName || "My Platform",
          logo: {
            "@type": "ImageObject",
            url: data.publisherLogo || "",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": data.url || "",
        },
      };

    case "Organization":
      return {
        ...base,
        name: data.name || "My Platform",
        url: data.url || "https://example.com",
        logo: data.logo || "",
        description: data.description || "",
        sameAs: data.sameAs || [],
        contactPoint: data.contactPoint || {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: data.email || "",
        },
      };

    case "Person":
      return {
        ...base,
        name: data.name || "",
        jobTitle: data.jobTitle || "",
        description: data.description || "",
        url: data.url || "",
        image: data.image || "",
        sameAs: data.sameAs || [],
        worksFor: data.worksFor
          ? {
              "@type": "Organization",
              name: data.worksFor,
            }
          : undefined,
      };

    case "BreadcrumbList":
      return {
        ...base,
        itemListElement: (data.items as Array<{ name: string; url: string }>)?.map(
          (item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })
        ) || [],
      };

    default:
      return { ...base, ...data };
  }
}

export function generateSitemap(posts: Post[]): string {
  const baseUrl = "https://example.com";
  const today = new Date().toISOString().split("T")[0];

  const staticRoutes = [
    { url: "/", priority: 1.0, changefreq: "daily" },
    { url: "/about", priority: 0.8, changefreq: "weekly" },
    { url: "/services", priority: 0.8, changefreq: "weekly" },
    { url: "/portfolio", priority: 0.9, changefreq: "weekly" },
    { url: "/contact", priority: 0.7, changefreq: "monthly" },
    { url: "/blog", priority: 0.9, changefreq: "daily" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticRoutes.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
    xml += `  </url>\n`;
  });

  posts.forEach((post) => {
    const postDate = post.updatedAt
      ? new Date(post.updatedAt).toISOString().split("T")[0]
      : today;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${postDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

export function generateRobotsTxt(): string {
  const baseUrl = "https://example.com";

  return `User-agent: *\nDisallow: /dashboard/*\nDisallow: /api/*\nDisallow: /seed\nDisallow: /admin\nDisallow: /_next\nDisallow: /static\n\nAllow: /api/og/*\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
}
