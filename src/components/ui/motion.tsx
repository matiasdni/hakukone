"use client";

import {
    AnimatePresence,
    motion,
    useInView,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    type HTMLMotionProps,
    type MotionValue,
    type Variants,
} from "motion/react";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================
// STANDARD ANIMATION VARIANTS
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

// ============================================
// STAGGER VARIANTS
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

// ============================================
// TRANSITION PRESETS
// ============================================

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const springBouncy = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // ease-out-expo
};

export const slowTransition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export const gentleSpring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

interface AnimatedDivProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, AnimatedDivProps>(
  function FadeIn({ children, delay = 0, ...props }, ref) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ ...smoothTransition, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

export const FadeInUp = forwardRef<HTMLDivElement, AnimatedDivProps>(
  function FadeInUp({ children, delay = 0, ...props }, ref) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ ...smoothTransition, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

export const ScaleIn = forwardRef<HTMLDivElement, AnimatedDivProps>(
  function ScaleIn({ children, delay = 0, ...props }, ref) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={scaleIn}
        transition={{ ...springTransition, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

export const BlurIn = forwardRef<HTMLDivElement, AnimatedDivProps>(
  function BlurIn({ children, delay = 0, ...props }, ref) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={blurIn}
        transition={{ ...slowTransition, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

// ============================================
// STAGGER COMPONENTS
// ============================================

interface StaggerListProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  fast?: boolean;
}

export function StaggerList({ children, fast, ...props }: StaggerListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fast ? staggerContainerFast : staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} transition={smoothTransition} {...props}>
      {children}
    </motion.div>
  );
}

// ============================================
// SCROLL-LINKED ANIMATIONS
// ============================================

interface ParallaxProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  offset?: number;
  direction?: "up" | "down";
}

export function Parallax({
  children,
  offset = 50,
  direction = "up",
  ...props
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [offset, -offset] : [-offset, offset]
  );

  return (
    <motion.div ref={ref} style={{ y }} {...props}>
      {children}
    </motion.div>
  );
}

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "fade" | "slide" | "scale" | "blur";
  delay?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  variant = "fade",
  delay = 0,
  once = true,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  const variants: Record<string, Variants> = {
    fade: fadeIn,
    slide: fadeInUp,
    scale: scaleIn,
    blur: blurIn,
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={{ ...smoothTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scroll progress indicator
export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return scaleX;
}

// ============================================
// MAGNETIC HOVER EFFECT
// ============================================

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = (e.clientX - centerX) * strength;
      const distanceY = (e.clientY - centerY) * strength;
      x.set(distanceX);
      y.set(distanceY);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// TEXT ANIMATIONS
// ============================================

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function TextReveal({
  children,
  className,
  delay = 0,
  staggerDelay = 0.03,
}: TextRevealProps) {
  const words = children.split(" ");

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay, delayChildren: delay },
        },
      }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "100%", opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={smoothTransition}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}

interface CharacterRevealProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function CharacterReveal({
  children,
  className,
  delay = 0,
  staggerDelay = 0.02,
}: CharacterRevealProps) {
  const characters = children.split("");

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay, delayChildren: delay },
        },
      }}
    >
      {characters.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={smoothTransition}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  formatOptions,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  const formattedValue = formatOptions
    ? new Intl.NumberFormat(undefined, formatOptions).format(displayValue)
    : displayValue.toLocaleString();

  return (
    <span ref={ref} className={className}>
      {formattedValue}
    </span>
  );
}

// ============================================
// PAGE TRANSITIONS
// ============================================

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={smoothTransition}
    >
      {children}
    </motion.div>
  );
}

export function PageTransitionSlide({
  children,
  direction = "right",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
}) {
  const offset = direction === "right" ? 30 : -30;
  return (
    <motion.div
      initial={{ opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -offset }}
      transition={smoothTransition}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// HOVER EFFECTS
// ============================================

interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hoverScale?: number;
  liftAmount?: number;
}

export function HoverCard({
  children,
  className,
  hoverScale = 1,
  liftAmount = 4,
  ...props
}: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -liftAmount,
        scale: hoverScale,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface HoverGlowProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  glowColor?: string;
}

export function HoverGlow({
  children,
  className,
  glowColor = "oklch(0.55 0.24 280 / 0.3)",
  ...props
}: HoverGlowProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}`,
        transition: { duration: 0.3 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 3D CARD TILT EFFECT
// ============================================

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
}

export function TiltCard({
  children,
  className,
  maxTilt = 10,
  perspective = 1000,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scaleValue = useMotionValue(1);

  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scaleValue, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const tiltX = (mouseY / (rect.height / 2)) * -maxTilt;
      const tiltY = (mouseX / (rect.width / 2)) * maxTilt;

      rotateX.set(tiltX);
      rotateY.set(tiltY);
      scaleValue.set(scale);
    },
    [maxTilt, scale, rotateX, rotateY, scaleValue]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scaleValue.set(1);
  }, [rotateX, rotateY, scaleValue]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective,
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// FLOATING ANIMATION
// ============================================

interface FloatProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
}

export function Float({
  children,
  amplitude = 10,
  duration = 3,
  ...props
}: FloatProps) {
  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SPOTLIGHT CURSOR EFFECT
// ============================================

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
}

export function Spotlight({ children, className, size = 400 }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(${size}px circle at ${x}px ${y}px, oklch(0.55 0.24 280 / 0.1), transparent 40%)`
          ),
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// TEXT SCRAMBLE EFFECT
// ============================================

interface TextScrambleProps {
  children: string;
  className?: string;
  duration?: number;
  trigger?: boolean;
}

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function TextScramble({
  children,
  className,
  duration = 1.5,
  trigger = true,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children);
  const isScramblingRef = useRef(false);
  const frameRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!trigger || isScramblingRef.current) return;
    
    isScramblingRef.current = true;
    const targetText = children;
    startTimeRef.current = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      let result = "";
      for (let i = 0; i < targetText.length; i++) {
        const charProgress = Math.min(progress * targetText.length - i + 3, 1);
        if (charProgress >= 1) {
          result += targetText[i];
        } else if (charProgress > 0) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(result);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(targetText);
        isScramblingRef.current = false;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      isScramblingRef.current = false;
    };
  }, [children, duration, trigger]);

  return <span className={className}>{displayText}</span>;
}

// ============================================
// MORPHING BLOB
// ============================================

interface MorphBlobProps {
  className?: string;
  colors?: string[];
  size?: number;
  speed?: number;
}

export function MorphBlob({
  className,
  colors = ["#8b5cf6", "#a855f7", "#d946ef"],
  size = 400,
  speed = 8,
}: MorphBlobProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(45deg, ${colors.join(", ")})`,
      }}
      animate={{
        borderRadius: [
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 60% 70% 40% / 50% 60% 30% 60%",
          "40% 60% 60% 40% / 70% 30% 50% 60%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
        ],
        rotate: [0, 360],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// ============================================
// CURSOR GLOW FOLLOWER
// ============================================

interface CursorGlowProps {
  color?: string;
  size?: number;
}

export function CursorGlow({ color = "rgba(139, 92, 246, 0.3)", size = 300 }: CursorGlowProps) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY, size]);

  return (
    <motion.div
      className="pointer-events-none fixed z-50 rounded-full blur-3xl"
      style={{
        width: size,
        height: size,
        background: color,
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: 0.6,
      }}
    />
  );
}

// ============================================
// INTERACTIVE GRID BACKGROUND
// ============================================

interface InteractiveGridProps {
  className?: string;
  cellSize?: number;
  color?: string;
}

export function InteractiveGrid({
  className,
  cellSize = 50,
  color = "rgba(139, 92, 246, 0.3)",
}: InteractiveGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate cells from dimensions (pure computation)
  const cells = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];
    const cols = Math.ceil(dimensions.width / cellSize);
    const rows = Math.ceil(dimensions.height / cellSize);
    
    const newCells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newCells.push({
          x: col * cellSize,
          y: row * cellSize,
          opacity: 0,
        });
      }
    }
    return newCells;
  }, [dimensions.width, dimensions.height, cellSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: -1000, y: -1000 });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {cells.map((cell, i) => {
        const distance = Math.sqrt(
          Math.pow(cell.x + cellSize / 2 - mousePos.x, 2) +
          Math.pow(cell.y + cellSize / 2 - mousePos.y, 2)
        );
        const maxDistance = 150;
        const opacity = Math.max(0, 1 - distance / maxDistance) * 0.5;
        
        return (
          <motion.div
            key={i}
            className="absolute border border-white/5"
            style={{
              left: cell.x,
              top: cell.y,
              width: cellSize,
              height: cellSize,
            }}
            animate={{
              backgroundColor: opacity > 0 ? color : "transparent",
              opacity: opacity > 0 ? opacity : 0.02,
            }}
            transition={{ duration: 0.15 }}
          />
        );
      })}
    </div>
  );
}

// ============================================
// MARQUEE / INFINITE SCROLL
// ============================================

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 30,
  direction = "left",
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className={`group flex overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex shrink-0 gap-4"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex shrink-0 gap-4"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// SPLIT TEXT ANIMATION
// ============================================

interface SplitTextProps {
  children: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  staggerDelay?: number;
  animation?: "wave" | "bounce" | "fade" | "slide";
}

export function SplitText({
  children,
  className,
  charClassName,
  delay = 0,
  staggerDelay = 0.03,
  animation = "wave",
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const characters = children.split("");

  const animations = {
    wave: {
      hidden: { y: 40, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    bounce: {
      hidden: { y: -20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { x: 20, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay, delayChildren: delay },
        },
      }}
    >
      {characters.map((char, i) => (
        <motion.span
          key={i}
          className={`inline-block ${charClassName}`}
          variants={animations[animation]}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================
// REVEAL ON SCROLL (CLIP PATH)
// ============================================

interface ClipRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export function ClipReveal({
  children,
  className,
  direction = "up",
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const clipPaths = {
    up: {
      hidden: "inset(100% 0 0 0)",
      visible: "inset(0 0 0 0)",
    },
    down: {
      hidden: "inset(0 0 100% 0)",
      visible: "inset(0 0 0 0)",
    },
    left: {
      hidden: "inset(0 100% 0 0)",
      visible: "inset(0 0 0 0)",
    },
    right: {
      hidden: "inset(0 0 0 100%)",
      visible: "inset(0 0 0 0)",
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: clipPaths[direction].hidden }}
      animate={{ clipPath: isInView ? clipPaths[direction].visible : clipPaths[direction].hidden }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// GOOEY BUTTON
// ============================================

interface GooeyButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GooeyButton({ children, className, onClick }: GooeyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600"
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-violet-500 via-purple-500 to-fuchsia-500"
        animate={{
          x: isHovered ? ["-100%", "100%"] : "-100%",
        }}
        transition={{
          duration: 0.6,
          ease: "linear",
        }}
        style={{ opacity: 0.5 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ============================================
// EXPORTS
// ============================================

export { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform };
export type { MotionValue, Variants };

