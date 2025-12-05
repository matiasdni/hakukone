"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const stats = [
  { key: "resumesCreated", value: 20, suffix: "+" },
  { key: "interviewRate", value: 2, suffix: "+" },
  { key: "userRating", value: 100, suffix: "%" },
  { key: "atsFriendly", value: 100, suffix: "%", label: "ATS Friendly" },
];

export function StatsBar() {
  const t = useTranslations("landing.stats");
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const statItems = gsap.utils.toArray<HTMLElement>(".stat-item");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(statItems, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      statItems.forEach((item) => {
        const numberEl = item.querySelector(".stat-number");
        // const targetValue = parseInt(item.dataset.value || "0"); // Not used directly by GSAP textContent tween here, but good for reference

        gsap.from(numberEl, {
          textContent: 0,
          duration: 2.5,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 85%",
          },
        });
      });
    },
    { scope: statsRef }
  );

  return (
    <section
      ref={statsRef}
      className="relative overflow-hidden border-y border-white/5 bg-(--color-surface) py-16"
    >
      {/* Subtle Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-(--color-primary)/5 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-item group text-center"
              data-value={stat.value}
            >
              <div className="mb-2 text-4xl font-bold text-(--color-text) transition-transform duration-300 group-hover:scale-110 group-hover:text-(--color-primary) md:text-6xl">
                <span className="stat-number">{stat.value}</span>
                <span className="text-(--color-primary)">{stat.suffix}</span>
              </div>
              <div className="text-sm font-medium tracking-wider text-(--color-muted) uppercase">
                {stat.label ||
                  t(
                    stat.key as
                      | "resumesCreated"
                      | "interviewRate"
                      | "userRating"
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
