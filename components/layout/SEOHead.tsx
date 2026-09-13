"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string;
  canonical?: string;
}

export function SEOHead({
  title,
  description,
  ogImage,
  keywords,
  canonical,
}: SEOHeadProps) {
  const { settings } = useSiteSettings();

  const seoSettings = settings?.seo || {};
  const brandName = settings?.brand?.name || "[YOUR_NAME]";

  const pageTitle = title
    ? `${title} | ${brandName}`
    : seoSettings.title || brandName;

  const pageDescription = description || seoSettings.description || "";
  const pageKeywords = keywords || seoSettings.keywords || "";
  const pageOgImage = ogImage || seoSettings.ogImage || "";
  const pageCanonical = canonical || seoSettings.canonical || "";

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      {pageOgImage && <meta property="og:image" content={pageOgImage} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageOgImage && <meta name="twitter:image" content={pageOgImage} />}

      {/* Canonical */}
      {pageCanonical && <link rel="canonical" href={pageCanonical} />}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
