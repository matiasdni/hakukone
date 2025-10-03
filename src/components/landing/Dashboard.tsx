"use client";

import { Button } from "@/components/ui/Button";
import { AnimatedCounter, BlurIn, ScrollReveal, Spotlight } from "@/components/ui/motion";
import { useAppStore } from "@/stores/useAppStore";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  FileText,
  Mail,
  Plus,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

// Animated gradient orb background
function GradientOrb({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.3, 0.2],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Stat card with glassmorphism
function StatCard({ 
  stat, 
  index 
}: { 
  stat: { label: string; value: number; icon: React.ElementType; href: string; gradient: string; shadowColor: string };
  index: number;
}) {
  const Icon = stat.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={stat.href}>
        <Spotlight className="h-full">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/80"
          >
            {/* Subtle gradient background on hover */}
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5 bg-linear-to-br ${stat.gradient}`} />
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  <AnimatedCounter value={stat.value} />
                </p>
              </div>
              <motion.div 
                className={`rounded-2xl bg-linear-to-br ${stat.gradient} p-3.5 shadow-lg ${stat.shadowColor}`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
            </div>
            
            {/* Hover arrow indicator */}
            <motion.div 
              className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100"
              initial={{ x: -5 }}
              whileHover={{ x: 0 }}
            >
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </motion.div>
          </motion.div>
        </Spotlight>
      </Link>
    </motion.div>
  );
}

// Recent item card
function RecentItemCard({ 
  item, 
  type,
  index
}: { 
  item: { id: string; name: string; subtitle: string; date: number };
  type: 'resume' | 'job';
  index: number;
}) {
  const isResume = type === 'resume';
  const Icon = isResume ? FileText : Briefcase;
  const href = isResume ? `/resumes/${item.id}` : '/jobs';
  const bgColor = isResume 
    ? 'bg-linear-to-br from-violet-500/10 to-purple-500/10 group-hover:from-violet-500/20 group-hover:to-purple-500/20' 
    : 'bg-linear-to-br from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20';
  const iconColor = isResume ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400';
  
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={href}
        className="group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${bgColor}`}
            whileHover={{ scale: 1.05 }}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </motion.div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {item.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {item.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{new Date(item.date).toLocaleDateString()}</span>
        </div>
      </Link>
    </motion.li>
  );
}

export function Dashboard() {
  const { resumes, coverLetters, jobs } = useAppStore();

  const stats = [
    {
      label: "Resumes",
      value: resumes.length,
      icon: FileText,
      href: "/resumes",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      shadowColor: "shadow-purple-500/30",
    },
    {
      label: "Cover Letters",
      value: coverLetters.length,
      icon: Mail,
      href: "/cover-letters",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      shadowColor: "shadow-rose-500/30",
    },
    {
      label: "Jobs Tracked",
      value: jobs.length,
      icon: Briefcase,
      href: "/jobs",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      shadowColor: "shadow-emerald-500/30",
    },
    {
      label: "Interviews",
      value: jobs.filter((j) => j.status === "Interview").length,
      icon: TrendingUp,
      href: "/jobs",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      shadowColor: "shadow-amber-500/30",
    },
  ];

  const recentResumes = [...resumes]
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 3)
    .map(r => ({
      id: r.id,
      name: r.fullName || "Untitled",
      subtitle: r.title || "No title",
      date: r.lastModified
    }));

  const recentJobs = [...jobs]
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 5)
    .map(j => ({
      id: j.id,
      name: j.role,
      subtitle: j.company,
      date: j.dateAdded,
      status: j.status
    }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background orbs */}
      <GradientOrb className="h-96 w-96 -top-48 -right-48 bg-purple-500" />
      <GradientOrb className="h-80 w-80 top-1/2 -left-40 bg-violet-500" />
      <GradientOrb className="h-64 w-64 bottom-20 right-1/4 bg-fuchsia-500" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(148, 163, 184) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(148, 163, 184) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="relative p-6 md:p-8">
        {/* Header */}
        <BlurIn>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  Dashboard
                </h1>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </motion.div>
              </div>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Welcome back! Here&apos;s your career progress at a glance.
              </p>
            </div>
            <Link href="/resumes/new">
              <Button variant="gradient" size="lg" className="group">
                <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                New Resume
              </Button>
            </Link>
          </motion.div>
        </BlurIn>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Recent Resumes */}
          <ScrollReveal>
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="border-b border-slate-100/50 p-5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Recent Resumes
                  </h2>
                  <Link 
                    href="/resumes" 
                    className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-5">
                {recentResumes.length === 0 ? (
                  <div className="py-10 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5"
                    >
                      <FileText className="h-8 w-8 text-slate-400" />
                    </motion.div>
                    <p className="mb-1 font-medium text-slate-600 dark:text-slate-300">No resumes yet</p>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Create your first resume to get started</p>
                    <Link href="/resumes/new">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Create Resume
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {recentResumes.map((resume, index) => (
                      <RecentItemCard 
                        key={resume.id} 
                        item={resume} 
                        type="resume" 
                        index={index} 
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Job Applications */}
          <ScrollReveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="border-b border-slate-100/50 p-5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Job Applications
                  </h2>
                  <Link 
                    href="/jobs" 
                    className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-5">
                {recentJobs.length === 0 ? (
                  <div className="py-10 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5"
                    >
                      <Briefcase className="h-8 w-8 text-slate-400" />
                    </motion.div>
                    <p className="mb-1 font-medium text-slate-600 dark:text-slate-300">No jobs tracked yet</p>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Start tracking your job applications</p>
                    <Link href="/jobs">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Add Job
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {recentJobs.map((job, index) => (
                      <motion.li
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 transition-all group-hover:from-emerald-500/20 group-hover:to-teal-500/20"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </motion.div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{job.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{job.subtitle}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide ${
                            job.status === "Interview"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : job.status === "Offer"
                                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                : job.status === "Applying"
                                  ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                          }`}
                        >
                          {job.status}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* CTA Section */}
        <ScrollReveal delay={0.2}>
          <motion.div
            className="relative mt-8 overflow-hidden rounded-3xl"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }}
            />
            
            {/* Floating orbs */}
            <motion.div
              className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative p-8 md:p-10">
              <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    AI-Powered
                  </motion.div>
                  <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                    Ready to land your dream job?
                  </h2>
                  <p className="max-w-lg text-white/80">
                    Our AI-powered tools can help you create the perfect resume and cover
                    letter tailored to any position.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/resumes/new">
                    <Button variant="secondary" size="lg" className="shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      New Resume
                    </Button>
                  </Link>
                  <Link href="/cover-letters/new">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="border border-white/20 text-white hover:bg-white/20 hover:text-white"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      New Cover Letter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}
