"use client";

import { useRouter } from "@/i18n/navigation";
import { SignIn, useUser } from "@stackframe/stack";
import { useEffect } from "react";

export default function SignInPage() {
  const user = useUser();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[--color-bg] text-white selection:bg-violet-500/30">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-violet-500/5 via-transparent to-transparent" />
      <div className="relative z-10">
        <SignIn />
      </div>
    </div>
  );
}
