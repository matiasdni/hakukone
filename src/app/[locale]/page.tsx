import { stackServerApp } from "@/app/stack/server";
import { Dashboard } from "@/components/landing/Dashboard";
import { LandingPage } from "@/components/landing/LandingPage";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await stackServerApp.getUser();

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
