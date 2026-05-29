// frontend/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User as UserIcon, Mail, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoginView, setIsLoginView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sign Up fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login fields — separate state so switching views doesn't bleed data
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Rehydrate session on mount
  useEffect(() => {
    const saved = localStorage.getItem("teckvora_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("teckvora_user");
      }
    }
  }, []);

  const switchToLogin = () => {
    setIsLoginView(true);
    setError("");
    setSuccessMsg("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchToSignup = () => {
    setIsLoginView(false);
    setError("");
    setSuccessMsg("");
    setShowLoginPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:50000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("teckvora_user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !phoneNumber || !birthday) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:50000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        // NOTE FOR BACKEND TEAM: when ready, add firstName, lastName,
        // phoneNumber, birthday to the users table and include them here.
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Account created! You can now sign in.");
        switchToLogin();
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teckvora_user");
    setUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setError("");
    setSuccessMsg("");
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-[#cdcdcd] border-none rounded-lg outline-none text-gray-800 text-sm";

  const labelClass = "block mb-1 text-sm text-gray-700";

  // ── LOGGED IN ───────────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
        <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
          My Account
        </h2>

        <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-[500px] mx-auto mt-20">

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="p-3 bg-gray-200 rounded-full">
              <UserIcon size={32} className="text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
              <Mail className="text-gray-400 shrink-0" size={16} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
              <ShieldCheck className="text-green-500 shrink-0" size={16} />
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Status</p>
                <p className="text-sm font-medium text-green-600">Active</p>
              </div>
            </div>
          </div>

          {/* Order history — backend deliverable */}
          {/* BACKEND TEAM: need GET /api/orders/user/:userId */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Order History
            </p>
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
              No orders yet.
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ── SIGN IN VIEW ─────────────────────────────────────────────────────────────
  if (isLoginView) {
    return (
      <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
        <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
          Sign In
        </h2>

        <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-[500px] mx-auto mt-20">

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 px-4 py-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>

            <div className="mb-4">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <p className="text-center mt-6 text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={switchToSignup}
                className="text-[#0F172A] font-semibold underline hover:opacity-70 transition-opacity"
              >
                Create a new account
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── SIGN UP VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
      <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
        Sign Up
      </h2>

      <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-[500px] mx-auto mt-20">

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} noValidate>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="John"
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="johndoe"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass}
                placeholder="+234..."
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={switchToLogin}
              className="text-[#0F172A] font-semibold underline hover:opacity-70 transition-opacity"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}