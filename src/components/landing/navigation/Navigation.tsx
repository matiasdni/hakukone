"use client";

import { motion } from "@/components/ui/motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function Navigation() {
  const t = useTranslations("landing");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          isScrolled
            ? "border-b border-white/5 bg-[oklch(0.13_0.02_280/0.8)] backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FileText className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
            </motion.div>
            <span className="text-lg font-bold text-white">{t("brand")}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {["features", "pricing", "testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="group relative px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <span className="relative z-10">{t(`nav.${item}`)}</span>
                <motion.span
                  className="absolute inset-0 rounded-lg bg-white/5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/sign-in"
              className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/sign-up"
              className="relative inline-flex h-8 items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-3 text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:from-violet-500 hover:to-purple-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t("nav.getStarted")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 text-white md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={
          isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
        }
        className={cn(
          "fixed inset-x-0 top-16 z-40 bg-[oklch(0.13_0.02_280/0.98)] backdrop-blur-xl md:hidden",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-2 p-4">
          {["features", "pricing", "testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className="rounded-lg px-4 py-3 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t(`nav.${item}`)}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            <Link
              href="/sign-in"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg px-4 py-2 font-medium text-slate-300 transition-all hover:bg-white/10"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-4 py-2 font-medium text-white transition-all"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
