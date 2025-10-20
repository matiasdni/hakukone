"use client";

import { Button } from "@/components/ui/Button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/stores/useAppStore";
import {
  Database,
  Download,
  Globe,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const {
    userProfile,
    setUserProfile,
    resumes,
    coverLetters,
    jobs,
    loadSampleData,
    clearAllData,
  } = useAppStore();

  const handleExportData = () => {
    const data = { resumes, coverLetters, jobs, userProfile };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-builder-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleData = () => {
    if (resumes.length > 0 || coverLetters.length > 0 || jobs.length > 0) {
      if (!confirm(t("confirmReplace"))) {
        return;
      }
    }
    loadSampleData();
  };

  const handleClearData = () => {
    if (confirm(t("confirmDelete"))) {
      clearAllData();
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    // Update user profile
    setUserProfile({
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      title: userProfile?.title || "",
      language: newLocale as "en" | "fi",
    });
    // Navigate to the new locale
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="max-w-3xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{t("title")}</h1>
        <p className="mt-1 text-slate-500">{t("description")}</p>
      </div>

      {/* Profile Section */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <User className="h-5 w-5 text-slate-600" />
          {t("profile.title")}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("profile.name")}
            </label>
            <input
              type="text"
              value={userProfile?.name || ""}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  name: e.target.value,
                  email: userProfile?.email || "",
                  title: userProfile?.title || "",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder={t("profile.namePlaceholder")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("profile.email")}
            </label>
            <input
              type="email"
              value={userProfile?.email || ""}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  email: e.target.value,
                  name: userProfile?.name || "",
                  title: userProfile?.title || "",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder={t("profile.emailPlaceholder")}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("profile.jobTitle")}
            </label>
            <input
              type="text"
              value={userProfile?.title || ""}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  title: e.target.value,
                  name: userProfile?.name || "",
                  email: userProfile?.email || "",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder={t("profile.jobTitlePlaceholder")}
            />
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Globe className="h-5 w-5 text-slate-600" />
          {t("language.title")}
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t("language.preferred")}
          </label>
          <select
            value={locale}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            aria-label={t("language.selectLabel")}
          >
            <option value="en">English</option>
            <option value="fi">Suomi</option>
          </select>
        </div>
      </section>

      {/* Data Section */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Database className="h-5 w-5 text-slate-600" />
          {t("data.title")}
        </h2>
        <div className="space-y-4">
          {/* Load Sample Data */}
          <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-linear-to-r from-purple-50 to-blue-50 p-4">
            <div>
              <p className="font-medium text-purple-700">
                {t("data.loadSample")}
              </p>
              <p className="text-sm text-purple-600">
                {t("data.loadSampleDescription")}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleLoadSampleData}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t("data.loadButton")}
            </Button>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-700">{t("data.export")}</p>
              <p className="text-sm text-slate-500">
                {t("data.exportDescription")}
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              {t("data.exportButton")}
            </Button>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4">
            <div>
              <p className="font-medium text-red-700">{t("data.delete")}</p>
              <p className="text-sm text-red-500">
                {t("data.deleteDescription")}
              </p>
            </div>
            <Button variant="danger" onClick={handleClearData}>
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-xl bg-slate-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          {t("stats.title")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{resumes.length}</p>
            <p className="text-sm text-slate-500">{t("stats.resumes")}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {coverLetters.length}
            </p>
            <p className="text-sm text-slate-500">{t("stats.coverLetters")}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{jobs.length}</p>
            <p className="text-sm text-slate-500">{t("stats.jobs")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
