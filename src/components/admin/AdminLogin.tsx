/**
 * AdminLogin.tsx — форма входу в /admin
 */
import React, { useState } from "react";
import { Shield, Lock, User, AlertCircle, Loader2 } from "lucide-react";

interface AdminLoginProps {
  onSuccess: (token: string, username: string) => void;
  onClose?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. POST /api/auth/login ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess("cookie", data.username);
      } else {
        setErrorMsg(data.error || "Невірний логін або пароль");
      }
    } catch (err) {
      setErrorMsg("Не вдалося підключитися до сервера авторизації.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#082d20] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-[#13563a] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#13563a] flex items-center justify-center text-[#ffd51f] shadow-lg">
            <Shield className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-[#082d20]">
            Панель управління
          </h2>
          <p className="text-xs text-[#64726a]">
            Löwen Defence® Україна · Вхід для адміністратора
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#082d20] mb-1">
              Логін
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-[#28aa5b]"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#082d20] mb-1">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-[#28aa5b]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-sm font-extrabold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Авторизація...</span>
              </span>
            ) : (
              <span>Увійти в адмінку →</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-gray-100">
          <p className="text-[0.72rem] text-gray-500">
            Логін/пароль задаються через env (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`).
          </p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-xs text-[#1b7048] font-bold underline hover:text-[#082d20]"
            >
              ← Повернутися на публічний сайт
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
