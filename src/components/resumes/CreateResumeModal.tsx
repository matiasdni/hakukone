"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateResume } from "@/hooks/useTRPC";
import { useRouter } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";

interface CreateResumeModalProps {
  children?: React.ReactNode;
}

/**
 * Modal for creating a new resume
 */
export const CreateResumeModal = memo(function CreateResumeModal({
  children,
}: CreateResumeModalProps) {
  const t = useTranslations("ResumesPage");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const createResume = useCreateResume();

  const handleCreate = useCallback(async () => {
    if (!title.trim()) return;

    try {
      const result = await createResume.mutateAsync({
        data: {
          lastModified: Date.now(),
          fullName: "",
          title: title.trim(),
          email: "",
          phone: "",
          location: "",
          summary: "",
          experience: [],
          education: [],
          skills: [],
          languages: [],
          certifications: [],
          customSections: [],
          sectionOrder: [],
        },
      });

      setIsOpen(false);
      setTitle("");
      router.push(`/resumes/${result.id}`);
    } catch (error) {
      console.error("Failed to create resume:", error);
    }
  }, [title, createResume, router]);

  return (
    <>
      {children ? (
        <div onClick={() => setIsOpen(true)}>{children}</div>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createNew")}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("createNew")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume-title">{t("resumeTitle")}</Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || createResume.isPending}
            >
              {createResume.isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

export default CreateResumeModal;
