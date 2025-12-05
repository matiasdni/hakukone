"use client";

import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function ScrollHero() {
  const t = useTranslations("landing.hero");
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Initial Reveal
      const tl = gsap.timeline();

      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.6, delay: 0.2 })
        .from(".hero-title", { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
        .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6 }, "-=0.6");

      // Parallax on Scroll (No Pinning)
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(contentRef.current, {
        yPercent: -10,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="min-h-(90vh) relative flex items-center justify-center overflow-hidden bg-(--color-bg) pt-20"
    >
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="h-(800px) w-(800px) blur-(120px) animate-pulse-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--color-primary) opacity-5" />
        <div className="h-(600px) w-(600px) blur-(100px) absolute top-0 right-0 translate-x-1/3 -translate-y-1/4 rounded-full bg-(--color-accent) opacity-5" />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 container px-4 text-center"
      >
        <div className="hero-badge mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-(--color-primary) backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>{t("badge")}</span>
        </div>

        <h1 className="hero-title mb-6 text-5xl font-bold tracking-tight text-(--color-text) md:text-7xl lg:text-8xl">
          {t("title")}{" "}
          <span className="bg-linear-to-r from-(--color-primary) to-(--color-accent) bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
        </h1>

        <p className="hero-subtitle mx-auto mb-10 max-w-2xl text-lg text-(--color-muted) md:text-xl">
          {t("description")}
        </p>

        <div className="hero-cta flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-12 rounded-full bg-(--color-primary) px-8 text-base transition-transform hover:scale-105 hover:bg-(--color-primary)/90"
            asChild
          >
            <Link href="/resumes/new">
              {t("cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-white/10 bg-white/5 text-(--color-text) transition-transform hover:scale-105 hover:bg-white/10"
            asChild
          >
            <Link href="/templates">{t("browseTemplates")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
