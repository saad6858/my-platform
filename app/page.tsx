/* filepath: components/FinalPage.tsx */
"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { FadeIn } from "@/components/animations/FadeIn";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/layout/SEOHead";

import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Pricing } from "@/components/sections/Pricing";
import { Portfolio } from "@/components/sections/Portfolio";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { CTABanner } from "@/components/sections/CTABanner";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";

export default function HomePage(): JSX.Element {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const sections = settings?.sections ?? {};
  const staggerDelay = 0.1;

  return (
    <>
      <SEOHead
        title="Home | MY-PLATFORM"
        description="Premium portfolio and business platform powered by AI."
        url="/"
      />
      <main className="bg-bg-primary">
        {sections.hero && (
          <FadeIn delay={staggerDelay * 0}>
            <Hero />
          </FadeIn>
        )}

        {sections.stats && (
          <FadeIn delay={staggerDelay * 1}>
            <Stats />
          </FadeIn>
        )}

        {sections.about && (
          <FadeIn delay={staggerDelay * 2}>
            <About />
          </FadeIn>
        )}

        {sections.services && (
          <FadeIn delay={staggerDelay * 3}>
            <Services />
          </FadeIn>
        )}

        {sections.process && (
          <FadeIn delay={staggerDelay * 4}>
            <Process />
          </FadeIn>
        )}

        {sections.pricing && (
          <FadeIn delay={staggerDelay * 5}>
            <Pricing />
          </FadeIn>
        )}

        {sections.portfolio && (
          <FadeIn delay={staggerDelay * 6}>
            <Portfolio />
          </FadeIn>
        )}

        {sections.testimonials !== false && (
          <FadeIn delay={staggerDelay * 7}>
            <Testimonials />
          </FadeIn>
        )}

        {sections.faq !== false && (
          <FadeIn delay={staggerDelay * 8}>
            <FAQ />
          </FadeIn>
        )}

        {sections.blog && (
          <FadeIn delay={staggerDelay * 9}>
            <Blog />
          </FadeIn>
        )}

        {sections.contact && (
          <FadeIn delay={staggerDelay * 10}>
            <Contact />
          </FadeIn>
        )}

        <FadeIn delay={staggerDelay * 11}>
          <CTABanner />
        </FadeIn>
      </main>
    </>
  );
}
