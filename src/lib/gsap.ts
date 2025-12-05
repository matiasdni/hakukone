import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  // Performance defaults
  gsap.defaults({
    ease: "power2.out",
    duration: 0.5,
    force3D: true, // Force hardware acceleration
  });

  // Optimize ScrollTrigger
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

export * from "@gsap/react";
export * from "gsap";
export * from "gsap/ScrollTrigger";
