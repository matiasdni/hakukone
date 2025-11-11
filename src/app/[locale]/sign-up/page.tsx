"use client";

import { useRouter } from "@/i18n/navigation";
import { SignUp, useUser } from "@stackframe/stack";
import { useEffect } from "react";

export default function SignUpPage() {
  const user = useUser();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-900 to-slate-800">
      <SignUp />
    </div>
  );
}
