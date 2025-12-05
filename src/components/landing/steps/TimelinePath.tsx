"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

export function TimelinePath() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>(".anim-path");

      paths.forEach((path) => {
        const pathLength = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 0.5,
          },
        });
      });

      // Animate step nodes
      const steps = gsap.utils.toArray<HTMLElement>(".step-node");
      steps.forEach((step) => {
        gsap.from(step, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: containerRef }
  );

  const steps = [
    {
      title: "Choose a Template",
      description: "Pick from our professional designs",
    },
    {
      title: "Fill in Your Details",
      description: "Our AI helps you write compelling content",
    },
    { title: "Export & Apply", description: "Download PDF and start applying" },
  ];

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-(--color-bg) py-24"
    >
      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-24 text-center">
          <h2 className="text-3xl font-bold text-(--color-text) md:text-5xl">
            How It Works
          </h2>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* SVG Path */}
          <svg className="pointer-events-none absolute top-0 left-5 h-full w-full overflow-visible md:left-0">
            <defs>
              <linearGradient
                id="pathGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity="0"
                />
                <stop offset="10%" stopColor="var(--color-primary)" />
                <stop offset="90%" stopColor="var(--color-accent)" />
                <stop
                  offset="100%"
                  stopColor="var(--color-accent)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {/* Background Path (faint) */}
            <path
              d="M 20 0 L 20 100%" // Mobile
              className="md:hidden"
              stroke="var(--color-surface)"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 50% 0 L 50% 100%" // Desktop
              className="hidden md:block"
              stroke="var(--color-surface)"
              strokeWidth="4"
              fill="none"
            />

            {/* Animated Path */}
            <path
              d="M 20 0 L 20 100%" // Mobile
              className="anim-path md:hidden"
              stroke="url(#pathGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 50% 0 L 50% 100%" // Desktop
              className="anim-path hidden md:block"
              stroke="url(#pathGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <div className="space-y-32">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`step-node relative flex items-center gap-8 md:gap-16 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Node Marker */}
                <div className="absolute left-5 z-10 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-(--color-primary) bg-(--color-bg) shadow-[0_0_20px_var(--color-primary)] md:left-1/2" />

                {/* Content */}
                <div
                  className={`ml-16 flex-1 md:ml-0 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                >
                  <div className="rounded-2xl border border-white/5 bg-(--color-surface) p-8 shadow-lg transition-colors duration-300 hover:border-(--color-primary)/30">
                    <h3 className="mb-3 text-2xl font-bold text-(--color-text)">
                      {step.title}
                    </h3>
                    <p className="text-lg text-(--color-muted)">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
