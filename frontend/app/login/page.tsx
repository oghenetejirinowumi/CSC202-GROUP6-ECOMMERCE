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
    "w-full px-3 py-2.5 mb-2.5 bg-[#cdcdcd] border-none rounded-lg outline-none";

  return (
    <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
      <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
        SIGN IN
      </h2>

      <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-[500px] mx-auto mt-20">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
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
            <label className="block mb-1">Password</label>
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
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#0F172A] font-semibold underline hover:opacity-70 transition-opacity"
            >
              Create a new account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
