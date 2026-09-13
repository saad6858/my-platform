/* filepath: components/SiteSettings.tsx */
"use client";

import Image from "next/image";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Layout,
  Palette,
  Search,
  Mail,
  CreditCard,
  MessageCircle,
  Bell,
  User,
  AlertTriangle,
  Check,
  Upload,
  Globe,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Download,
  Database,
  X,
  ChevronDown,
} from "lucide-react";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { SectionToggle } from "./SectionToggle";
import { ColorPicker } from "./ColorPicker";
import { TemplateEditor } from "./TemplateEditor";
import { cn } from "@/lib/utils";

interface SectionConfig {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  features: string[];
}

interface SiteConfig {
  sections: Record<string, boolean>;
  appearance: {
    accentColor: string;
    fontFamily: string;
    customCursor: boolean;
    particleBackground: boolean;
    auroraEffect: boolean;
    meshGradient: boolean;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    ogImageUrl: string;
    keywords: string;
    robotsContent: string;
  };
  contact: {
    whatsapp: string;
    email: string;
    location: string;
    linkedin: string;
    github: string;
    twitter: string;
  };
  pricing: {
    baseRate: string;
    perPictureRate: string;
    currencySymbol: string;
    tiers: PricingTier[];
  };
  whatsappTemplates: {
    defaultOutreach: string;
    followUp: string;
    sampleRequest: string;
    pricingResponse: string;
  };
  notifications: {
    emailEnabled: boolean;
    newLead: boolean;
    newContact: boolean;
    dailySummary: boolean;
    notificationEmail: string;
  };
  account: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    photoUrl: string;
  };
}

const defaultConfig: SiteConfig = {
  sections: {
    hero: true,
    about: true,
    services: true,
    portfolio: true,
    blog: true,
    contact: true,
    stats: true,
    process: true,
    pricing: true,
    realEstateService: true,
    automationService: true,
    agenticAIService: true,
  },
  appearance: {
    accentColor: "var(--accent-primary)",
    fontFamily: "Inter",
    customCursor: false,
    particleBackground: false,
    auroraEffect: true,
    meshGradient: false,
  },
  seo: {
    siteTitle: "My Platform",
    siteDescription: "Premium portfolio and business platform",
    ogImageUrl: "",
    keywords: "portfolio, business, services",
    robotsContent: "User-agent: *\nDisallow:",
  },
  contact: {
    whatsapp: "",
    email: "",
    location: "",
    linkedin: "",
    github: "",
    twitter: "",
  },
  pricing: {
    baseRate: "5000",
    perPictureRate: "500",
    currencySymbol: "₨",
    tiers: [
      { id: "starter", name: "Starter", price: "5000", features: ["Basic features", "Email support"] },
      { id: "professional", name: "Professional", price: "15000", features: ["Advanced features", "Priority support", "Custom integrations"] },
      { id: "enterprise", name: "Enterprise", price: "50000", features: ["All features", "Dedicated support", "White-label option", "API access"] },
    ],
  },
  whatsappTemplates: {
    defaultOutreach: "Hi {{name}},\n\nI hope this message finds you well. I'm reaching out from {{agency}} regarding...",
    followUp: "Hi {{name}},\n\nJust following up on my previous message...",
    sampleRequest: "Hi {{name}},\n\nThank you for your interest. Here are the samples you requested...",
    pricingResponse: "Hi {{name}},\n\nThank you for inquiring about our pricing. Our rates are as follows...",
  },
  notifications: {
    emailEnabled: true,
    newLead: true,
    newContact: true,
    dailySummary: false,
    notificationEmail: "",
  },
  account: {
    name: "",
    email: "",
    phone: "",
    bio: "",
    photoUrl: "",
  },
};

const sectionDefinitions: Omit<SectionConfig, "enabled">[] = [
  { id: "hero", label: "Hero Section", description: "Main landing hero with animations" },
  { id: "about", label: "About Section", description: "Personal bio and timeline" },
  { id: "services", label: "Services Section", description: "Service offerings cards" },
  { id: "portfolio", label: "Portfolio Section", description: "Project showcase grid" },
  { id: "blog", label: "Blog Section", description: "Blog posts preview and listing" },
  { id: "contact", label: "Contact Section", description: "Contact form and info" },
  { id: "stats", label: "Stats Section", description: "Animated statistics bar" },
  { id: "process", label: "Process Section", description: "How it works steps" },
  { id: "pricing", label: "Pricing Section", description: "Pricing tiers" },
  { id: "realEstateService", label: "Real Estate Service", description: "AI Property Walkthroughs card" },
  { id: "automationService", label: "Automation Service", description: "AI Workflow Automation card" },
  { id: "agenticAIService", label: "Agentic AI Service", description: "Agentic AI Systems card" },
];

const accentColors = [
  { name: "emerald", value: "var(--accent-primary)" },
  { name: "blue", value: "#3b82f6" },
  { name: "purple", value: "#a855f7" },
  { name: "amber", value: "var(--accent-tertiary)" },
  { name: "rose", value: "#f43f5e" },
  { name: "cyan", value: "#06b6d4" },
];

const fontOptions = ["Inter", "Roboto", "Poppins", "Space Grotesk"];
const currencyOptions = ["₨", "$", "€", "£"];

const tabs = [
  { id: "sections", label: "Sections", icon: Layout },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "seo", label: "SEO", icon: Search },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "pricing", label: "Pricing", icon: CreditCard },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
];

const seoPages = [
  { page: "Home", title: "", description: "" },
  { page: "About", title: "", description: "" },
  { page: "Services", title: "", description: "" },
  { page: "Portfolio", title: "", description: "" },
  { page: "Blog", title: "", description: "" },
  { page: "Contact", title: "", description: "" },
];

export function SiteSettings() : JSX.Element {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("sections");
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [resetStep, setResetStep] = useState(0);
  const [resetInput, setResetInput] = useState("");
  const [showDangerConfirm, setShowDangerConfirm] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, "site_settings", "config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SiteConfig>;
        setConfig((prev) => ({
          ...prev,
          ...data,
          sections: { ...prev.sections, ...data.sections },
          appearance: { ...prev.appearance, ...data.appearance },
          seo: { ...prev.seo, ...data.seo },
          contact: { ...prev.contact, ...data.contact },
          pricing: { ...prev.pricing, ...data.pricing },
          whatsappTemplates: { ...prev.whatsappTemplates, ...data.whatsappTemplates },
          notifications: { ...prev.notifications, ...data.notifications },
          account: { ...prev.account, ...data.account },
        }));
        if (data.seo?.ogImageUrl) {
          setOgImagePreview(data.seo.ogImageUrl);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = useCallback(
    async (updates?: Partial<SiteConfig>) => {
      if (!user) return;
      setSaving(true);
      try {
        const newConfig = updates ? { ...config, ...updates } : config;
        await setDoc(doc(db, "site_settings", "config"), newConfig, { merge: true });
        if (updates) {
          setConfig(newConfig);
        }
        showToast("Settings saved", "success");
      } catch (error) {
        console.error("Error saving settings:", error);
        showToast("Failed to save settings", "error");
      } finally {
        setSaving(false);
      }
    },
    [config, user]
  );

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const updateSection = async (sectionId: string, enabled: boolean) => {
    const newSections = { ...config.sections, [sectionId]: enabled };
    const newConfig = { ...config, sections: newSections };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updateAppearance = async (key: keyof SiteConfig["appearance"], value: string | boolean) => {
    const newAppearance = { ...config.appearance, [key]: value };
    const newConfig = { ...config, appearance: newAppearance };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updateSEO = async (key: keyof SiteConfig["seo"], value: string) => {
    const newSeo = { ...config.seo, [key]: value };
    const newConfig = { ...config, seo: newSeo };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updateContact = async (key: keyof SiteConfig["contact"], value: string) => {
    const newContact = { ...config.contact, [key]: value };
    const newConfig = { ...config, contact: newContact };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updatePricing = async (key: keyof SiteConfig["pricing"], value: string) => {
    const newPricing = { ...config.pricing, [key]: value };
    const newConfig = { ...config, pricing: newPricing };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updateTier = (tierId: string, field: keyof PricingTier, value: string | string[]) => {
    const newTiers = config.pricing.tiers.map((tier) =>
      tier.id === tierId ? { ...tier, [field]: value } : tier
    );
    const newConfig = { ...config, pricing: { ...config.pricing, tiers: newTiers } };
    setConfig(newConfig);
    saveSettings(newConfig);
  };

  const addTierFeature = (tierId: string) => {
    const newTiers = config.pricing.tiers.map((tier) =>
      tier.id === tierId ? { ...tier, features: [...tier.features, "New feature"] } : tier
    );
    const newConfig = { ...config, pricing: { ...config.pricing, tiers: newTiers } };
    setConfig(newConfig);
    saveSettings(newConfig);
  };

  const removeTierFeature = (tierId: string, index: number) => {
    const newTiers = config.pricing.tiers.map((tier) =>
      tier.id === tierId
        ? { ...tier, features: tier.features.filter((_, i) => i !== index) }
        : tier
    );
    const newConfig = { ...config, pricing: { ...config.pricing, tiers: newTiers } };
    setConfig(newConfig);
    saveSettings(newConfig);
  };

  const updateTierFeature = (tierId: string, index: number, value: string) => {
    const newTiers = config.pricing.tiers.map((tier) =>
      tier.id === tierId
        ? { ...tier, features: tier.features.map((f, i) => (i === index ? value : f)) }
        : tier
    );
    const newConfig = { ...config, pricing: { ...config.pricing, tiers: newTiers } };
    setConfig(newConfig);
    saveSettings(newConfig);
  };

  const updateTemplate = async (key: keyof SiteConfig["whatsappTemplates"], value: string) => {
    const newTemplates = { ...config.whatsappTemplates, [key]: value };
    const newConfig = { ...config, whatsappTemplates: newTemplates };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updateNotification = async (key: keyof SiteConfig["notifications"], value: boolean | string) => {
    const newNotifications = { ...config.notifications, [key]: value };
    const newConfig = { ...config, notifications: newNotifications };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const updateAccount = async (key: keyof SiteConfig["account"], value: string) => {
    const newAccount = { ...config.account, [key]: value };
    const newConfig = { ...config, account: newAccount };
    setConfig(newConfig);
    await saveSettings(newConfig);
  };

  const handleResetSettings = async () => {
    if (resetStep === 0) {
      setResetStep(1);
      return;
    }
    if (resetStep === 1) {
      if (resetInput === "RESET") {
        setConfig(defaultConfig);
        await saveSettings(defaultConfig);
        setResetStep(0);
        setResetInput("");
        setShowDangerConfirm(null);
        showToast("All settings reset to default", "success");
      } else {
        showToast("Type RESET to confirm", "error");
      }
    }
  };

  const handleClearData = async () => {
    if (!user) return;
    try {
      const collections = ["contact_submissions", "newsletter", "leads", "projects"];
      for (const colName of collections) {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      }
      setShowDangerConfirm(null);
      showToast("All data cleared", "success");
    } catch (error) {
      console.error("Error clearing data:", error);
      showToast("Failed to clear data", "error");
    }
  };

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setOgImagePreview(result);
        updateSEO("ogImageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-accent-quaternary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg",
              toast.type === "success" ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30" : "bg-danger/20 text-danger border border-danger/30"
            )}
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Site Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your site configuration and preferences</p>
        </div>
        <button
          onClick={() => saveSettings()}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent-quaternary hover:bg-accent-quaternary/90 text-text-primary rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                  activeTab === tab.id ? "text-accent-quaternary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-quaternary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Sections Tab */}
          {activeTab === "sections" && (
            <FadeIn>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Control What Visitors See</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Toggle sections on/off. Disabled sections are hidden from public pages.
                  </p>
                </div>
                <div className="grid gap-3">
                  {sectionDefinitions.map((section) => (
                    <GlassCard key={section.id} className="p-4">
                      <SectionToggle
                        label={section.label}
                        description={section.description}
                        enabled={config.sections[section.id] ?? true}
                        onChange={(enabled) => updateSection(section.id, enabled)}
                      />
                    </GlassCard>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <FadeIn>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Accent Color</h3>
                    <ColorPicker
                      colors={accentColors.map((c) => c.value)}
                      selected={config.appearance.accentColor}
                      onChange={(color) => updateAppearance("accentColor", color)}
                    />
                  </GlassCard>

                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Font Family</h3>
                    <div className="relative">
                      <select
                        value={config.appearance.fontFamily}
                        onChange={(e) => updateAppearance("fontFamily", e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm appearance-none cursor-pointer focus:outline-none focus:border-accent-quaternary"
                      >
                        {fontOptions.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Animation Toggles</h3>
                    <div className="space-y-3">
                      {[
                        { key: "customCursor", label: "Enable Custom Cursor", desc: "Desktop only" },
                        { key: "particleBackground", label: "Enable Particle Background", desc: "Animated particles" },
                        { key: "auroraEffect", label: "Enable Aurora Effect", desc: "Gradient aurora background" },
                        { key: "meshGradient", label: "Enable Mesh Gradient", desc: "Mesh gradient overlay" },
                      ].map((item) => (
                        <SectionToggle
                          key={item.key}
                          label={item.label}
                          description={item.desc}
                          enabled={config.appearance[item.key as keyof SiteConfig["appearance"]] as boolean}
                          onChange={(enabled) => updateAppearance(item.key as keyof SiteConfig["appearance"], enabled)}
                        />
                      ))}
                    </div>
                  </GlassCard>
                </div>

                <div>
                  <GlassCard className="p-6 sticky top-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Live Preview</h3>
                    <div
                      className="rounded-lg p-6 space-y-4 transition-colors duration-300"
                      style={{
                        background: config.appearance.meshGradient
                          ? "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-secondary) 100%)"
                          : config.appearance.auroraEffect
                          ? "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)"
                          : "var(--bg-secondary)",
                        fontFamily: config.appearance.fontFamily,
                      }}
                    >
                      <div
                        className="h-2 w-24 rounded-full"
                        style={{ backgroundColor: config.appearance.accentColor }}
                      />
                      <h4 className="text-xl font-bold text-text-primary">Sample Heading</h4>
                      <p className="text-sm text-text-secondary">
                        This is how your content will look with the selected font and accent color.
                      </p>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary"
                        style={{ backgroundColor: config.appearance.accentColor }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </FadeIn>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <FadeIn>
              <div className="space-y-6">
                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">General SEO</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Site Title</label>
                      <input
                        type="text"
                        value={config.seo.siteTitle}
                        onChange={(e) => updateSEO("siteTitle", e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Site Description
                        <span className="text-text-secondary ml-2 text-xs">({config.seo.siteDescription.length}/160)</span>
                      </label>
                      <textarea
                        value={config.seo.siteDescription}
                        onChange={(e) => updateSEO("siteDescription", e.target.value.slice(0, 160))}
                        rows={3}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">OG Image</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={config.seo.ogImageUrl}
                          onChange={(e) => {
                            updateSEO("ogImageUrl", e.target.value);
                            setOgImagePreview(e.target.value);
                          }}
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm hover:bg-white/5 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleOgImageUpload}
                          className="hidden"
                        />
                      </div>
                      {ogImagePreview && (
                        <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden bg-bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <Image src={ogImagePreview} alt="OG Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Keywords</label>
                      <input
                        type="text"
                        value={config.seo.keywords}
                        onChange={(e) => updateSEO("keywords", e.target.value)}
                        placeholder="portfolio, business, services..."
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Robots.txt</label>
                      <textarea
                        value={config.seo.robotsContent}
                        onChange={(e) => updateSEO("robotsContent", e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm font-mono focus:outline-none focus:border-accent-quaternary resize-none"
                      />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Per-Page SEO</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-3 text-sm font-medium text-text-secondary">Page</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-text-secondary">Meta Title</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-text-secondary">Meta Description</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-text-secondary">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seoPages.map((page) => (
                          <tr key={page.page} className="border-b border-white/5">
                            <td className="py-3 px-3 text-sm text-text-primary">{page.page}</td>
                            <td className="py-3 px-3 text-sm text-text-secondary">{page.title || "—"}</td>
                            <td className="py-3 px-3 text-sm text-text-secondary">{page.description || "—"}</td>
                            <td className="py-3 px-3">
                              <button className="text-accent-quaternary hover:text-accent-quaternary/80 text-sm font-medium">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            </FadeIn>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <FadeIn>
              <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <Phone className="w-4 h-4 text-text-secondary" />
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={config.contact.whatsapp}
                        onChange={(e) => updateContact("whatsapp", e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <Mail className="w-4 h-4 text-text-secondary" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={config.contact.email}
                        onChange={(e) => updateContact("email", e.target.value)}
                        placeholder="hello@example.com"
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <MapPin className="w-4 h-4 text-text-secondary" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={config.contact.location}
                        onChange={(e) => updateContact("location", e.target.value)}
                        placeholder="City, Country"
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <Linkedin className="w-4 h-4 text-text-secondary" />
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={config.contact.linkedin}
                        onChange={(e) => updateContact("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <Github className="w-4 h-4 text-text-secondary" />
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={config.contact.github}
                        onChange={(e) => updateContact("github", e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <Twitter className="w-4 h-4 text-text-secondary" />
                        Twitter/X URL
                      </label>
                      <input
                        type="url"
                        value={config.contact.twitter}
                        onChange={(e) => updateContact("twitter", e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Social Links Preview</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Phone, label: "WhatsApp", value: config.contact.whatsapp, color: "text-accent-primary" },
                      { icon: Mail, label: "Email", value: config.contact.email, color: "text-accent-quaternary" },
                      { icon: Linkedin, label: "LinkedIn", value: config.contact.linkedin, color: "text-accent-quaternary" },
                      { icon: Github, label: "GitHub", value: config.contact.github, color: "text-text-primary" },
                      { icon: Twitter, label: "Twitter/X", value: config.contact.twitter, color: "text-sky-400" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg bg-bg-secondary border border-white/5",
                          !item.value && "opacity-40"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", item.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{item.label}</p>
                          <p className="text-xs text-text-secondary truncate">{item.value || "Not set"}</p>
                        </div>
                        {item.value ? (
                          <Check className="w-4 h-4 text-accent-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-text-secondary" />
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </FadeIn>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <FadeIn>
              <div className="space-y-6">
                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Pricing Settings</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Base Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                          {config.pricing.currencySymbol}
                        </span>
                        <input
                          type="number"
                          value={config.pricing.baseRate}
                          onChange={(e) => updatePricing("baseRate", e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Per Picture Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                          {config.pricing.currencySymbol}
                        </span>
                        <input
                          type="number"
                          value={config.pricing.perPictureRate}
                          onChange={(e) => updatePricing("perPictureRate", e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Currency Symbol</label>
                      <div className="relative">
                        <select
                          value={config.pricing.currencySymbol}
                          onChange={(e) => updatePricing("currencySymbol", e.target.value)}
                          className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm appearance-none cursor-pointer focus:outline-none focus:border-accent-quaternary"
                        >
                          {currencyOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <div className="grid lg:grid-cols-3 gap-6">
                  {config.pricing.tiers.map((tier) => (
                    <GlassCard key={tier.id} className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                          className="bg-transparent text-lg font-semibold text-text-primary focus:outline-none border-b border-transparent focus:border-accent-quaternary"
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                            {config.pricing.currencySymbol}
                          </span>
                          <input
                            type="text"
                            value={tier.price}
                            onChange={(e) => updateTier(tier.id, "price", e.target.value)}
                            className="w-24 pl-6 pr-2 py-1 bg-bg-secondary border border-white/10 rounded text-text-primary text-sm text-right focus:outline-none focus:border-accent-quaternary"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => updateTierFeature(tier.id, index, e.target.value)}
                              className="flex-1 px-2 py-1 bg-bg-secondary border border-white/10 rounded text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                            />
                            <button
                              onClick={() => removeTierFeature(tier.id, index)}
                              className="p-1 text-danger hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addTierFeature(tier.id)}
                          className="flex items-center gap-1 text-sm text-accent-quaternary hover:text-accent-quaternary/80 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Feature
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* WhatsApp Tab */}
          {activeTab === "whatsapp" && (
            <FadeIn>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">WhatsApp Message Templates</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Use {"{{name}}"} for agent name, {"{{agency}}"} for agency name
                  </p>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary">Default Outreach Message</h3>
                    <TemplateEditor
                      value={config.whatsappTemplates.defaultOutreach}
                      onChange={(value) => updateTemplate("defaultOutreach", value)}
                      variables={["name", "agency"]}
                    />
                  </GlassCard>
                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary">Follow-up Message</h3>
                    <TemplateEditor
                      value={config.whatsappTemplates.followUp}
                      onChange={(value) => updateTemplate("followUp", value)}
                      variables={["name", "agency"]}
                    />
                  </GlassCard>
                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary">Sample Request Response</h3>
                    <TemplateEditor
                      value={config.whatsappTemplates.sampleRequest}
                      onChange={(value) => updateTemplate("sampleRequest", value)}
                      variables={["name", "agency"]}
                    />
                  </GlassCard>
                  <GlassCard className="p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary">Pricing Response</h3>
                    <TemplateEditor
                      value={config.whatsappTemplates.pricingResponse}
                      onChange={(value) => updateTemplate("pricingResponse", value)}
                      variables={["name", "agency"]}
                    />
                  </GlassCard>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <FadeIn>
              <div className="max-w-2xl space-y-6">
                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Notification Preferences</h3>
                  <div className="space-y-3">
                    <SectionToggle
                      label="Email Notifications"
                      description="Receive notifications via email"
                      enabled={config.notifications.emailEnabled}
                      onChange={(enabled) => updateNotification("emailEnabled", enabled)}
                    />
                    <SectionToggle
                      label="New Lead Notification"
                      description="Get notified when a new lead is submitted"
                      enabled={config.notifications.newLead}
                      onChange={(enabled) => updateNotification("newLead", enabled)}
                    />
                    <SectionToggle
                      label="New Contact Submission"
                      description="Get notified when someone fills the contact form"
                      enabled={config.notifications.newContact}
                      onChange={(enabled) => updateNotification("newContact", enabled)}
                    />
                    <SectionToggle
                      label="Daily Summary"
                      description="Receive a daily summary of all activity"
                      enabled={config.notifications.dailySummary}
                      onChange={(enabled) => updateNotification("dailySummary", enabled)}
                    />
                  </div>
                </GlassCard>

                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Notification Email</h3>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Email Address for Notifications
                    </label>
                    <input
                      type="email"
                      value={config.notifications.notificationEmail}
                      onChange={(e) => updateNotification("notificationEmail", e.target.value)}
                      placeholder="notifications@example.com"
                      className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                    />
                  </div>
                </GlassCard>
              </div>
            </FadeIn>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <FadeIn>
              <div className="space-y-6">
                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
                      <input
                        type="text"
                        value={config.account.name}
                        onChange={(e) => updateAccount("name", e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                      <input
                        type="email"
                        value={config.account.email}
                        onChange={(e) => updateAccount("email", e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
                      <input
                        type="tel"
                        value={config.account.phone}
                        onChange={(e) => updateAccount("phone", e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Photo URL</label>
                      <input
                        type="url"
                        value={config.account.photoUrl}
                        onChange={(e) => updateAccount("photoUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Bio</label>
                    <textarea
                      value={config.account.bio}
                      onChange={(e) => updateAccount("bio", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary resize-none"
                    />
                  </div>
                </GlassCard>

                <GlassCard className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-accent-quaternary hover:bg-accent-quaternary/90 text-text-primary rounded-lg text-sm font-medium transition-colors">
                    Update Password
                  </button>
                </GlassCard>

                <GlassCard className="p-6 border-danger/20">
                  <h3 className="text-lg font-semibold text-danger flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-danger/5 rounded-lg border border-danger/10">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Reset All Settings</p>
                        <p className="text-xs text-text-secondary">Reset all settings to their default values</p>
                      </div>
                      <button
                        onClick={() => setShowDangerConfirm("reset")}
                        className="px-3 py-1.5 bg-danger/20 text-danger rounded-lg text-sm font-medium hover:bg-danger/30 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-danger/5 rounded-lg border border-danger/10">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Clear All Data</p>
                        <p className="text-xs text-text-secondary">Delete all submissions, leads, and projects</p>
                      </div>
                      <button
                        onClick={() => setShowDangerConfirm("clear")}
                        className="px-3 py-1.5 bg-danger/20 text-danger rounded-lg text-sm font-medium hover:bg-danger/30 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </FadeIn>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Danger Confirm Modal */}
      <AnimatePresence>
        {showDangerConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-secondary border border-white/10 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-danger/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {showDangerConfirm === "reset" ? "Reset All Settings" : "Clear All Data"}
                </h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                {showDangerConfirm === "reset"
                  ? "This will reset all settings to their default values. This action cannot be undone."
                  : "This will permanently delete all your data including contacts, leads, and projects."}
              </p>
              {showDangerConfirm === "reset" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Type "RESET" to confirm
                  </label>
                  <input
                    type="text"
                    value={resetInput}
                    onChange={(e) => setResetInput(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-primary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-danger"
                  />
                </div>
              )}
              {showDangerConfirm === "clear" && (
                <div className="mb-4 p-3 bg-accent-tertiary/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-accent-tertiary flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Export your data first before clearing
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDangerConfirm(null);
                    setResetStep(0);
                    setResetInput("");
                  }}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showDangerConfirm === "reset" ? handleResetSettings : handleClearData}
                  disabled={showDangerConfirm === "reset" && resetInput !== "RESET"}
                  className="px-4 py-2 bg-danger/20 text-danger rounded-lg text-sm font-medium hover:bg-danger/30 transition-colors disabled:opacity-50"
                >
                  {showDangerConfirm === "reset" ? "Reset Settings" : "Clear All Data"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
