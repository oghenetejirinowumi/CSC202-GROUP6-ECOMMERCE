"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !username) {
      alert("Please fill in all fields");
      return;
    }

    alert("Signin successful (demo)");
  };

  const inputClass =
    "w-full px-3 py-2.5 mb-2.5 bg-[#cdcdcd] border-none rounded-lg outline-none";

  return (
    <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
      <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
        SIGN IN
      </h2>

      <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-[500px] mx-auto mt-20">
        <form onSubmit={handleLogin}>

          {/* Username or Email */}
          <div className="mb-4">
            <label className="block mb-1"> Username or Email </label>
            <input
              type="email"
              value={email || username}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes("@")) {
                  setEmail(value);
                  setUsername("");
                } else {
                  setUsername(value);
                  setEmail("");
                }
              }}
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label> Password </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#0F172A] underline hover:opacity-70 transition-opacity"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Stay Signed In */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
            />
            <span>Keep me Signed In</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>

          {/* Create Account Link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
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
