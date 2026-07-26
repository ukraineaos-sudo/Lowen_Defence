"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AdminLogin } from "@/src/components/admin/AdminLogin";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const sessionExpired = searchParams.get("reason") === "session_expired";
  const destination = next.startsWith("/admin") ? next : "/admin";

  return (
    <AdminLogin
      sessionExpired={sessionExpired}
      onSuccess={() => {
        // Hard navigation: soft router.replace+refresh races with RSC cache
        // that still remembers the pre-login middleware redirect to /login.
        window.location.assign(destination);
      }}
      onClose={() => router.push("/")}
    />
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#082d20] flex items-center justify-center text-white text-sm">
          Завантаження…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
