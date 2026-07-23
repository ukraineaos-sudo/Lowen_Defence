"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AdminLogin } from "@/src/components/admin/AdminLogin";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  return (
    <AdminLogin
      onSuccess={() => {
        router.replace(next.startsWith("/admin") ? next : "/admin");
        router.refresh();
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
