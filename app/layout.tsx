import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CustomCursor } from "@/components/animations/CustomCursor";
import { ScrollProgress } from "@/components/animations/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "My Platform — Premium Digital Solutions",
    template: "%s | My Platform",
  },
  description: "A premium portfolio and business platform built with cutting-edge technology. Real estate visualization, workflow automation, and agentic AI solutions.",
  keywords: ["portfolio", "real estate", "automation", "agentic AI", "digital solutions"],
  authors: [{ name: "My Platform" }],
  creator: "My Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://my-platform.vercel.app",
    siteName: "My Platform",
    title: "My Platform — Premium Digital Solutions",
    description: "A premium portfolio and business platform built with cutting-edge technology.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Platform — Premium Digital Solutions",
    description: "A premium portfolio and business platform built with cutting-edge technology.",
    images: ["/og-image.jpg"],
  },
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
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-bg-primary text-text-primary font-sans antialiased overflow-x-hidden">
        <AuthProvider>
          <ThemeProvider>
            <AnnouncementBar />
            <ScrollProgress />
            <Navbar />
            <main className="relative min-h-screen">
              {children}
            </main>
            <Footer />
            <CustomCursor />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
