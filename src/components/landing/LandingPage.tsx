"use client";
import {
    AnimatedCounter,
    ClipReveal,
    CursorGlow,
    HoverCard,
    InteractiveGrid,
    Magnetic,
    MorphBlob,
    motion,
    ScrollReveal,
    SplitText,
    Spotlight,
    TextScramble,
    TiltCard,
    useScroll,
    useSpring,
    useTransform,
} from "@/components/ui/motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    Check,
    ChevronRight,
    FileText,
    Globe,
    type LucideIcon,
    Menu,
    Palette,
    Sparkles,
    Star,
    Target,
    X,
    Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

// ============================================
// TYPES
// ============================================

type FeatureKey = "templates" | "ai" | "match" | "export" | "customization" | "languages";
type PlanKey = "free" | "pro" | "team";

// ============================================
// CONFIG
// ============================================

const featureIcons: Record<FeatureKey, LucideIcon> = {
  templates: FileText,
  ai: Sparkles,
  match: Target,
  export: Zap,
  customization: Palette,
  languages: Globe,
};

const featureKeys: FeatureKey[] = ["templates", "ai", "match", "export", "customization", "languages"];
const planKeys: PlanKey[] = ["free", "pro", "team"];
const planFeatureCounts: Record<PlanKey, number> = { free: 5, pro: 7, team: 7 };
const testimonialCount = 3;

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-60 h-0.5 origin-left bg-linear-to-r from-violet-500 via-purple-500 to-fuchsia-500"
      style={{ scaleX }}
    />
  );
}

// ============================================
// NAVIGATION
// ============================================

function Navigation() {
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
            ? "bg-[oklch(0.13_0.02_280/0.8)] backdrop-blur-xl border-b border-white/5"
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
              className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {t("nav.signIn")}
            </Link>
            <Magnetic strength={0.2}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-lg relative overflow-hidden bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/25 text-white"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t("nav.getStarted")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Magnetic>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
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
              className="px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t(`nav.${item}`)}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-10 px-4 py-2 font-medium rounded-lg text-slate-300 hover:bg-white/10 transition-all w-full"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-10 px-4 py-2 font-medium rounded-lg bg-linear-to-r from-violet-600 to-purple-600 text-white transition-all w-full"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ============================================
// HERO SECTION
// ============================================

function HeroSection() {
  const t = useTranslations("landing");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Interactive Grid Background */}
      <InteractiveGrid className="z-0" cellSize={60} color="rgba(139, 92, 246, 0.15)" />
      
      {/* Morphing Blobs */}
      <MorphBlob
        className="top-20 left-[10%] opacity-40"
        colors={["#8b5cf6", "#a855f7", "#d946ef"]}
        size={500}
        speed={10}
      />
      <MorphBlob
        className="top-40 right-[5%] opacity-30"
        colors={["#06b6d4", "#8b5cf6", "#a855f7"]}
        size={600}
        speed={12}
      />
      <MorphBlob
        className="bottom-10 left-[30%] opacity-25"
        colors={["#d946ef", "#ec4899", "#f43f5e"]}
        size={400}
        speed={8}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-50" />

      {/* Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          <TextScramble className="text-sm font-medium text-violet-300" duration={1}>
            {t("hero.badge")}
          </TextScramble>
          <ChevronRight className="h-4 w-4 text-violet-400" />
        </motion.div>

        {/* Headline with Split Text Animation */}
        <div className="text-center">
          <ClipReveal direction="up">
            <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              <SplitText animation="wave" staggerDelay={0.02}>
                {t("hero.title")}
              </SplitText>
            </h1>
          </ClipReveal>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <span className="mt-4 block text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              <SplitText animation="wave" delay={0.3} staggerDelay={0.02}>
                {t("hero.titleHighlight")}
              </SplitText>
            </span>
          </motion.div>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mt-8 max-w-2xl text-center text-lg text-slate-400 sm:text-xl"
        >
          {t("hero.description")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic strength={0.15}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/sign-up"
                className="group relative overflow-hidden rounded-full bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-8 py-4 text-lg font-medium text-white shadow-2xl shadow-purple-500/30 inline-flex items-center"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t("hero.cta")}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </span>
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </Link>
            </motion.div>
          </Magnetic>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/templates"
              className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm inline-flex items-center hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {t("hero.browseTemplates")}
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-16"
        >
          {[
            { value: 50000, suffix: "+", labelKey: "stats.resumesCreated" },
            { value: 94, suffix: "%", labelKey: "stats.interviewRate" },
            { value: 4.9, suffix: "/5", labelKey: "stats.userRating", stars: true },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="group text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="relative text-5xl font-bold text-white lg:text-6xl">
                  <AnimatedCounter
                    value={stat.value}
                    duration={2.5}
                    formatOptions={stat.value < 100 && stat.value % 1 !== 0 ? { minimumFractionDigits: 1 } : undefined}
                  />
                  <span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {stat.suffix}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-sm text-slate-400">
                {stat.stars && (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                )}
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500">{t("hero.scroll")}</span>
            <div className="h-12 w-6 rounded-full border border-white/20 p-1">
              <motion.div
                className="h-2 w-2 rounded-full bg-violet-400"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// TRUSTED BY / STATS SHOWCASE
// ============================================

function TrustedBySection() {
  const highlights = [
    { label: "Templates Available", value: "20+" },
    { label: "Languages Supported", value: "2+" },
    { label: "AI-Powered", value: "100%" },
    { label: "ATS Friendly", value: "Yes" },
  ];

  return (
    <section className="relative border-y border-white/5 bg-[oklch(0.11_0.02_280)] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
          Built for professionals
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center px-4"
            >
              <span className="text-3xl font-bold text-white/80">
                {item.value}
              </span>
              <span className="mt-1 text-sm text-slate-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================

function FeaturesSection() {
  const t = useTranslations("landing");
  const [activeFeature, setActiveFeature] = useState<FeatureKey>("templates");

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[oklch(0.13_0.02_280)]" />
      
      {/* Gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center">
          <ScrollReveal variant="blur">
            <span className="inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-violet-400">
              Features
            </span>
          </ScrollReveal>

          <ScrollReveal variant="slide" delay={0.1}>
            <h2 className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {t("features.title")}
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade" delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              {t("features.subtitle")}
            </p>
          </ScrollReveal>
        </div>

        {/* Interactive Feature Showcase */}
        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Feature List */}
          <div className="space-y-4">
            {featureKeys.map((key, index) => {
              const Icon = featureIcons[key];
              const isActive = activeFeature === key;
              
              return (
                <ScrollReveal key={key} variant="slide" delay={index * 0.05}>
                  <motion.div
                    className={cn(
                      "group relative cursor-pointer rounded-2xl border p-6 transition-all",
                      isActive
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5"
                    )}
                    onClick={() => setActiveFeature(key)}
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {/* Active indicator */}
                    <motion.div
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-violet-500 to-purple-600"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: isActive ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    <div className="flex items-start gap-4">
                      <motion.div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                          isActive
                            ? "bg-linear-to-br from-violet-500 to-purple-600 text-white"
                            : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {t(`features.${key}.title`)}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                          {t(`features.${key}.description`)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Feature Preview */}
          <ScrollReveal variant="scale">
            <div className="sticky top-32">
              <TiltCard maxTilt={8} scale={1.02}>
                <Spotlight className="rounded-3xl" size={500}>
                  <motion.div
                    className="relative h-[500px] overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8"
                    layout
                  >
                    {/* Animated feature visualization */}
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="flex h-full flex-col items-center justify-center"
                    >
                      <motion.div
                        className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-500/20"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        {(() => {
                          const Icon = featureIcons[activeFeature];
                          return <Icon className="h-12 w-12 text-violet-400" />;
                        })()}
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-white text-center">
                        {t(`features.${activeFeature}.title`)}
                      </h3>
                      <p className="mt-4 max-w-sm text-center text-slate-400">
                        {t(`features.${activeFeature}.description`)}
                      </p>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
                      <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-3xl" />
                    </motion.div>
                  </motion.div>
                </Spotlight>
              </TiltCard>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================

function PricingSection() {
  const t = useTranslations("landing");
  const [hoveredPlan, setHoveredPlan] = useState<PlanKey | null>(null);

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[oklch(0.13_0.02_280)] via-[oklch(0.15_0.03_280)] to-[oklch(0.13_0.02_280)]" />
      
      {/* Decorative blob */}
      <MorphBlob
        className="top-20 right-[10%] opacity-20"
        colors={["#8b5cf6", "#06b6d4"]}
        size={400}
        speed={15}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center">
          <ScrollReveal variant="blur">
            <span className="inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-violet-400">
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
                    <span className="text-slate-400">{t("pricing.perMonth")}</span>
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
                          <Check className={cn(
                            "h-3 w-3",
                            isPopular ? "text-violet-400" : "text-slate-400"
                          )} />
                        </motion.div>
                        <span className="text-slate-300">
                          {t(`pricing.${planKey}.features.${i}`)}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/sign-up"
                      className={cn(
                        "w-full rounded-xl py-3 font-medium transition-all block text-center",
                        isPopular
                          ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                          : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
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

// ============================================
// TESTIMONIALS SECTION
// ============================================

function TestimonialsSection() {
  const t = useTranslations("landing");

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[oklch(0.13_0.02_280)]" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center">
          <ScrollReveal variant="blur">
            <span className="inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-violet-400">
              Testimonials
            </span>
          </ScrollReveal>

          <ScrollReveal variant="slide" delay={0.1}>
            <h2 className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {t("testimonials.title")}
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade" delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              {t("testimonials.subtitle")}
            </p>
          </ScrollReveal>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: testimonialCount }).map((_, index) => (
            <ScrollReveal key={index} variant="scale" delay={index * 0.1}>
              <HoverCard liftAmount={8}>
                <div className="group relative h-full rounded-2xl border border-white/5 bg-white/2 p-8 backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/4">
                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-linear-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Stars */}
                  <div className="relative mb-6 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, type: "spring" }}
                        viewport={{ once: true }}
                      >
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="relative mb-8 text-lg text-slate-300 leading-relaxed">
                    &ldquo;{t(`testimonials.items.${index}.content`)}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="relative flex items-center gap-4">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-lg font-semibold text-white"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      {t(`testimonials.items.${index}.avatar`)}
                    </motion.div>
                    <div>
                      <div className="font-semibold text-white">
                        {t(`testimonials.items.${index}.name`)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {t(`testimonials.items.${index}.role`)}
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================

function CTASection() {
  const t = useTranslations("landing");

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[oklch(0.13_0.02_280)]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <ScrollReveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-linear-to-br from-violet-600/30 via-purple-600/30 to-fuchsia-600/30"
              animate={{
                background: [
                  "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.3) 50%, rgba(217,70,239,0.3) 100%)",
                  "linear-gradient(225deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.3) 50%, rgba(217,70,239,0.3) 100%)",
                  "linear-gradient(315deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.3) 50%, rgba(217,70,239,0.3) 100%)",
                  "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.3) 50%, rgba(217,70,239,0.3) 100%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl p-px gradient-border-animated" />

            {/* Content */}
            <div className="relative p-12 text-center lg:p-20">
              {/* Background orbs */}
              <motion.div
                className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
                animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl"
                animate={{ x: [20, -20, 20], y: [10, -10, 10] }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="relative text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                  {t("cta.title")}
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative mx-auto mt-6 max-w-xl text-lg text-slate-400"
              >
                {t("cta.description")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative mt-10"
              >
                <Magnetic strength={0.15}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/sign-up"
                      className="group relative overflow-hidden rounded-full bg-white px-10 py-4 text-lg font-medium text-slate-900 shadow-2xl inline-flex items-center"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {t("cta.button")}
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.span>
                      </span>
                    </Link>
                  </motion.div>
                </Magnetic>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================

function Footer() {
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
                className="hover:text-white transition-colors"
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

// ============================================
// MAIN COMPONENT
// ============================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.13_0.02_280)] text-white">
      {/* Global cursor glow effect */}
      <CursorGlow color="rgba(139, 92, 246, 0.15)" size={400} />
      
      <ScrollProgress />
      <Navigation />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
