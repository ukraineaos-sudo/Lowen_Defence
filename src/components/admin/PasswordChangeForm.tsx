/**
 * PasswordChangeForm.tsx — зміна пароля адміна
 */
"use client";

import React, { useState } from "react";
import { KeyRound, Loader2, Check, AlertCircle } from "lucide-react";
import { adminFetch } from "@/lib/admin/admin-fetch";

export const PasswordChangeForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- 1. Валідація + POST /api/admin/password ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Новий пароль має містити щонайменше 8 символів");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Новий пароль і підтвердження не збігаються");
      return;
    }

    setLoading(true);
    try {
      const result = await adminFetch<{
        success?: boolean;
        message?: string;
      }>("/api/admin/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      if (result.ok && result.data.success) {
        setSuccess(result.data.message || "Пароль змінено");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (!result.ok && result.error.status !== 401) {
        setError(result.error.message || "Не вдалося змінити пароль");
      }
    } catch {
      setError("Помилка зв’язку із сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-lg space-y-4">
      <div className="pb-3 border-b border-gray-200">
        <h3 className="font-black text-lg text-[#082d20] flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#28aa5b]" />
          <span>Зміна пароля</span>
        </h3>
        <p className="text-xs text-[#64726a] mt-1">
          Новий пароль зберігається в захищеному сховищі. Env{" "}
          <code>ADMIN_PASSWORD_HASH</code> лишається запасним стартовим значенням.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1">
            Поточний пароль
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-[#28aa5b]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1">
            Новий пароль (мін. 8)
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-[#28aa5b]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1">
            Підтвердження нового пароля
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-[#28aa5b]"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-800 text-xs rounded-xl flex items-center gap-2 border border-green-200">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary text-sm py-2.5 px-4 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Збереження…</span>
            </>
          ) : (
            <span>Змінити пароль</span>
          )}
        </button>
      </form>
    </div>
  );
};
