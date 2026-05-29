"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 mb-2.5 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-transparent dark:border-gray-700 rounded-lg outline-none";

  return (
    <div className="px-5 py-10 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors">
      <h2 className="text-center mt-16 text-5xl font-bold text-slate-900 dark:text-slate-100">
        SIGN IN
      </h2>

      <div className="px-5 py-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 max-w-[500px] mx-auto mt-20 transition-colors">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 dark:text-gray-100">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-900 dark:text-gray-100">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="block mx-auto px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-slate-900 dark:text-white font-semibold underline hover:opacity-70 transition-opacity"
            >
              Create a new account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
