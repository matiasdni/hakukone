import { stackServerApp } from "@/app/stack/server";
import { Sidebar } from "@/components/Sidebar";
import { StoreHydrator } from "@/components/providers/StoreHydrator";
import { routing } from "@/i18n/routing";
import { TRPCReactProvider } from "@/trpc";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  // Check if user is authenticated
  const user = await stackServerApp.getUser();

  // For unauthenticated users, show full-page content (landing page, auth pages)
  if (!user) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </NextIntlClientProvider>
    );
  }

  // For authenticated users, show the app with sidebar
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TRPCReactProvider>
        <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <Suspense fallback={<SidebarSkeleton />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 overflow-auto">
            <Suspense>
              <StoreHydrator />
            </Suspense>
            {children}
          </main>
        </div>
      </TRPCReactProvider>
    </NextIntlClientProvider>
  );
}

// Skeleton sidebar matching the new design
function SidebarSkeleton() {
  return (
    <aside className="w-64 border-r border-slate-200/60 bg-linear-to-b from-slate-50 via-white to-slate-50/80 p-4 dark:border-white/10 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950">
      <div className="animate-pulse space-y-6">
        {/* Logo skeleton */}
        <div className="flex items-center gap-3 p-1">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-200 to-purple-200 dark:from-violet-800 dark:to-purple-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
            <div className="h-2 w-16 rounded-md bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
        
        {/* Separator */}
        <div className="h-px bg-slate-200 dark:bg-slate-700" />
        
        {/* Nav items skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-200 px-3 dark:bg-slate-700" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 flex-1 rounded-md bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
        
        {/* Pro card skeleton */}
        <div className="mt-auto rounded-2xl bg-linear-to-br from-violet-200 to-purple-200 p-4 dark:from-violet-800/50 dark:to-purple-800/50">
          <div className="space-y-3">
            <div className="h-3 w-16 rounded bg-white/50 dark:bg-white/20" />
            <div className="h-2 w-full rounded bg-white/30 dark:bg-white/10" />
            <div className="h-8 w-full rounded-lg bg-white/80 dark:bg-white/20" />
          </div>
        </div>
      </div>
    </aside>
  );
}
