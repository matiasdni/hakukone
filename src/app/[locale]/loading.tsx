"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated gradient spinner */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-20 blur-xl" />
          
          {/* Spinning ring */}
          <motion.div
            className="relative h-14 w-14"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
            <div className="absolute inset-[3px] rounded-full bg-white dark:bg-slate-900" />
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 [clip-path:polygon(50%_50%,100%_0,100%_100%,50%_100%)]" />
          </motion.div>
          
          {/* Center dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-r from-violet-600 to-purple-600"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        
        {/* Loading text with shimmer effect */}
        <div className="relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading...
          </p>
          <motion.div
            className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/50 to-transparent dark:via-white/10"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        {/* Skeleton preview hint */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-violet-400 dark:bg-violet-600"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
