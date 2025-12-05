"use client";

import { motion } from "@/components/ui/motion";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="relative border-t border-white/5 bg-[oklch(0.11_0.02_280)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">{t("brand")}</span>
          </motion.div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
            {["privacy", "terms", "contact"].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="transition-colors hover:text-white"
                whileHover={{ y: -2 }}
              >
                {t(`footer.${item}`)}
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-sm text-slate-500">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </div>
    </footer>
  );
}
