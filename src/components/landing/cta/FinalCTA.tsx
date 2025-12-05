"use client";

import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function FinalCTA() {
  const t = useTranslations("landing.cta");
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(".cta-title", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".cta-desc",
          { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .from(
          ".cta-btn",
          { scale: 0.8, opacity: 0, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.6"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-(--color-bg) py-32 text-center"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-(--color-primary)/10" />

      {/* Floating Orbs */}
      <div className="animate-float absolute top-0 left-1/4 h-64 w-64 rounded-full bg-(--color-primary)/5 blur-3xl" />
      <div className="animate-float-delayed absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-(--color-accent)/5 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4">
        <h2 className="cta-title mb-6 text-4xl font-bold text-(--color-text) md:text-6xl">
          {t("title")}
        </h2>
        <p className="cta-desc mx-auto mb-10 max-w-2xl text-xl text-(--color-muted)">
          {t("description")}
        </p>
        <div className="cta-btn">
          <Button
            size="lg"
            className="h-14 rounded-full bg-(--color-primary) px-10 text-lg shadow-(--color-primary)/25 shadow-lg transition-transform hover:scale-105 hover:bg-(--color-primary)/90"
            asChild
          >
            <Link href="/resumes/new">
              {t("button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
