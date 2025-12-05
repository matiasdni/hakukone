"use client";

import { motion, ScrollReveal } from "@/components/ui/motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type PlanKey = "free" | "pro" | "team";

const planKeys: PlanKey[] = ["free", "pro", "team"];
const planFeatureCounts: Record<PlanKey, number> = { free: 5, pro: 7, team: 7 };

export function PricingSection() {
  const t = useTranslations("landing");
  const [hoveredPlan, setHoveredPlan] = useState<PlanKey | null>(null);

  return (
    <section id="pricing" className="relative overflow-hidden py-32">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[oklch(0.13_0.02_280)] via-[oklch(0.15_0.03_280)] to-[oklch(0.13_0.02_280)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center">
          <ScrollReveal variant="blur">
            <span className="inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-semibold tracking-wider text-violet-400 uppercase">
              Pricing
            </span>
          </ScrollReveal>

          <ScrollReveal variant="slide" delay={0.1}>
            <h2 className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {t("pricing.title")}
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade" delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              {t("pricing.subtitle")}
            </p>
          </ScrollReveal>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {planKeys.map((planKey, index) => {
            const isPopular = planKey === "pro";
            const isHovered = hoveredPlan === planKey;
            const featureCount = planFeatureCounts[planKey];

            return (
              <ScrollReveal key={planKey} variant="slide" delay={index * 0.15}>
                <motion.div
                  className={cn(
                    "relative h-full rounded-3xl border p-8 transition-colors",
                    isPopular
                      ? "border-violet-500/50 bg-linear-to-b from-violet-500/10 via-purple-500/5 to-transparent"
                      : "border-white/5 bg-white/2 hover:border-white/10"
                  )}
                  onMouseEnter={() => setHoveredPlan(planKey)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      animate={{
                        y: [0, -4, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="rounded-full bg-linear-to-r from-violet-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-purple-500/30">
                        {t("pricing.pro.popular")}
                      </div>
                    </motion.div>
                  )}

                  {/* Gradient glow on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 opacity-0"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Plan info */}
                  <div className="relative mb-8">
                    <h3 className="text-2xl font-bold text-white">
                      {t(`pricing.${planKey}.name`)}
                    </h3>
                    <p className="mt-2 text-slate-400">
                      {t(`pricing.${planKey}.description`)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="relative mb-8">
                    <span className="text-5xl font-bold text-white">
                      ${t(`pricing.${planKey}.price`)}
                    </span>
                    <span className="text-slate-400">
                      {t("pricing.perMonth")}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="relative mb-8 space-y-4">
                    {Array.from({ length: featureCount }).map((_, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className={cn(
                            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            isPopular ? "bg-violet-500/20" : "bg-white/10"
                          )}
                          whileHover={{ scale: 1.2, rotate: 180 }}
                        >
                          <Check
                            className={cn(
                              "h-3 w-3",
                              isPopular ? "text-violet-400" : "text-slate-400"
                            )}
                          />
                        </motion.div>
                        <span className="text-slate-300">
                          {t(`pricing.${planKey}.features.${i}`)}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/sign-up"
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-medium transition-all",
                        isPopular
                          ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                          : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      )}
                    >
                      {t(`pricing.${planKey}.cta`)}
                    </Link>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
