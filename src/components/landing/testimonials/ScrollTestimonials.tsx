"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function ScrollTestimonials() {
  const t = useTranslations("landing.testimonials");
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const marquee = marqueeRef.current;
      if (!marquee) return;

      // Simple continuous scroll
      const tl = gsap.to(marquee, {
        x: "-50%",
        duration: 30, // Slower for better readability
        ease: "none",
        repeat: -1,
      });

      // Pause on hover
      marquee.addEventListener("mouseenter", () => tl.pause());
      marquee.addEventListener("mouseleave", () => tl.play());

      // Reveal animation
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: containerRef }
  );

  const testimonials = [0, 1, 2].map((i) => ({
    name: t(`items.${i}.name`),
    role: t(`items.${i}.role`),
    content: t(`items.${i}.content`),
    avatar: t(`items.${i}.avatar`),
  }));

  // Double the items for marquee loop
  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-(--color-surface) py-24"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-linear-to-b from-transparent via-(--color-primary)/5 to-transparent" />

      <div className="relative z-10 container mx-auto mb-16 px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-(--color-text) md:text-5xl">
          {t("title")}
        </h2>
        <p className="text-lg text-(--color-muted)">{t("subtitle")}</p>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradient Masks */}
        <div className="absolute top-0 bottom-0 left-0 z-20 w-20 bg-linear-to-r from-(--color-surface) to-transparent" />
        <div className="absolute top-0 right-0 bottom-0 z-20 w-20 bg-linear-to-l from-(--color-surface) to-transparent" />

        <div ref={marqueeRef} className="flex w-fit gap-8 px-4">
          {allTestimonials.map((item, index) => (
            <div
              key={index}
              className="w-(300px) md:w-(400px) shrink-0 rounded-2xl border border-white/10 bg-(--color-bg) p-8 transition-colors duration-300 hover:border-(--color-primary)/30"
            >
              <Quote className="mb-6 h-8 w-8 text-(--color-primary) opacity-50" />
              <p className="mb-6 text-lg leading-relaxed text-(--color-text)">
                &quot;{item.content}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary)/20 font-bold text-(--color-primary)">
                  {item.avatar}
                </div>
                <div>
                  <div className="font-bold text-(--color-text)">
                    {item.name}
                  </div>
                  <div className="text-sm text-(--color-muted)">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
