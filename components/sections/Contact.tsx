/* filepath: components/sections/Contact.tsx */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { GlassCard } from "@/components/layout/GlassCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { addDocument } from "@/lib/db";

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
}

const SERVICES = [
  "AI Property Walkthroughs",
  "AI Workflow Automation",
  "Agentic AI Systems",
  "Web Development",
  "Other",
];

export function Contact() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (settingsLoading) return null;
  if (settings?.sections?.contact === false) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await addDocument("contact_submissions", {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: "new",
        source: "website",
      });

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        "Something went wrong. Please try again or contact me directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <SectionWrapper id="contact" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Info */}
          <div>
            <FadeIn>
              <SectionLabel text="CONTACT" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-4">
                Let&apos;s Build Something
                <span className="text-accent-primary"> Extraordinary</span>
              </h2>
              <p className="text-text-secondary text-lg mt-4 leading-relaxed">
                Ready to transform your business with AI? Whether you need
                cinematic property videos, automated workflows, or intelligent
                agents — I&apos;m here to help.
              </p>
            </FadeIn>

            <div className="mt-10 space-y-6">
              <FadeIn delay={0.1}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold">Email</h3>
                    <a
                      href="mailto:your.email@example.com"
                      className="text-text-secondary hover:text-accent-primary transition-colors"
                    >
                      your.email@example.com
                    </a>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold">Phone</h3>
                    <a
                      href="tel:+923001234567"
                      className="text-text-secondary hover:text-accent-primary transition-colors"
                    >
                      +92 300 123 4567
                    </a>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold">
                      Location
                    </h3>
                    <p className="text-text-secondary">
                      Lahore, Pakistan
                      <br />
                      <span className="text-sm">
                        Available for remote projects worldwide
                      </span>
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Right Column - Form */}
          <FadeIn delay={0.2} direction="left">
            <GlassCard className="p-8">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-accent-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-text-secondary">
                    Thank you for reaching out. I&apos;ll get back to you within
                    24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Name <span className="text-accent-tertiary">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary/50 transition-colors ${
                          errors.name
                            ? "border-red-500/50"
                            : "border-white/10"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email <span className="text-accent-tertiary">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary/50 transition-colors ${
                          errors.email
                            ? "border-red-500/50"
                            : "border-white/10"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Phone <span className="text-accent-tertiary">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+92 300 123 4567"
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary/50 transition-colors ${
                          errors.phone
                            ? "border-red-500/50"
                            : "border-white/10"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Service{" "}
                        <span className="text-accent-tertiary">*</span>
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50 transition-colors appearance-none ${
                          errors.service
                            ? "border-red-500/50"
                            : "border-white/10"
                        } ${!formData.service ? "text-text-secondary/50" : ""}`}
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        {SERVICES.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                      {errors.service && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.service}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Message <span className="text-accent-tertiary">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project..."
                      rows={5}
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary/50 transition-colors resize-none ${
                        errors.message
                          ? "border-red-500/50"
                          : "border-white/10"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {submitError}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent-primary text-bg-primary py-4 rounded-xl font-semibold hover:bg-accent-secondary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    </SectionWrapper>
  );
}
