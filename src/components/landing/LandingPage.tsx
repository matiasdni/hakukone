"use client";
import { motion, useScroll, useSpring } from "@/components/ui/motion";
import { FinalCTA } from "./cta/FinalCTA";
import { ScrollFeatures } from "./features/ScrollFeatures";
import { Footer } from "./footer/Footer";
import { ScrollHero } from "./hero/ScrollHero";
import { Navigation } from "./navigation/Navigation";
import { PricingSection } from "./pricing/PricingSection";
import { StatsBar } from "./stats/StatsBar";
import { TimelinePath } from "./steps/TimelinePath";
import { ScrollTestimonials } from "./testimonials/ScrollTestimonials";

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
      className="fixed top-0 right-0 left-0 z-60 h-0.5 origin-left bg-linear-to-r from-violet-500 via-purple-500 to-fuchsia-500"
      style={{ scaleX }}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <ScrollProgress />
      <Navigation />
      <ScrollHero />
      <StatsBar />
      <ScrollFeatures />
      <TimelinePath />
      <PricingSection />
      <ScrollTestimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
