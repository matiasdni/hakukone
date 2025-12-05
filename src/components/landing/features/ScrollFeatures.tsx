"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { LayoutTemplate, Rocket, Target, Wand2, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function ScrollFeatures() {
  const t = useTranslations("landing.features");
  const featuresRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

      gsap.from(cards, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // 3D Tilt Effect on Hover
      cards.forEach((card) => {
        card.addEventListener("mousemove", (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = card.getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left;
          const y = mouseEvent.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
          const rotateY = ((x - centerX) / centerX) * 5;

          gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        });
      });
    },
    { scope: featuresRef }
  );

  const features = [
    {
      icon: Wand2,
      title: t("ai.title"),
      description: t("ai.description"),
      className: "col-span-1 md:col-span-2 lg:col-span-2",
    },
    {
      icon: Target,
      title: t("match.title"),
      description: t("match.description"),
      className: "col-span-1 md:col-span-2 lg:col-span-1",
    },
    {
      icon: LayoutTemplate,
      title: t("templates.title"),
      description: t("templates.description"),
      className: "col-span-1",
    },
    {
      icon: Zap,
      title: t("export.title"),
      description: t("export.description"),
      className: "col-span-1",
    },
    {
      icon: Rocket,
      title: t("customization.title"),
      description: t("customization.description"),
      className: "col-span-1",
    },
  ];

  return (
    <section
      ref={featuresRef}
      className="relative overflow-hidden bg-(--color-bg) py-24"
    >
      {/* Background Elements */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-(--color-primary)/5 to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-(--color-text) md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-(--color-muted)">
            {t("subtitle")}
          </p>
        </div>

        <div className="perspective-1000 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card group relative rounded-2xl border border-white/10 bg-(--color-surface) p-8 transition-all duration-300 hover:border-(--color-primary)/30 hover:shadow-(--color-primary)/10 hover:shadow-2xl ${feature.className}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10 text-(--color-primary) transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-(--color-text)">
                {feature.title}
              </h3>
              <p className="text-(--color-muted)">{feature.description}</p>

              {/* Shine Effect */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-tr from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
