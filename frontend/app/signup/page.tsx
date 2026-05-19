"use client";

import React, { useState } from "react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !username || !password || !phoneNumber) {
      alert("Please fill in all fields");
      return;
    }

    alert("Sign up successful");
  };

  const inputClass =
    "w-full px-3 py-2.5 mb-2.5 bg-[#cdcdcd] border-none rounded-lg outline-none";

  return (
    <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
      <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
        Sign Up
      </h2>

      <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-[500px] mx-auto mt-20">
        <form onSubmit={handleSignup}>
          {/* First Name */}
          <div className="mb-4">
            <label className="block mb-1"> First Name* </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block mb-1"> Last Name* </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1"> Email </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block mb-1"> Username </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-1"> Password </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block mb-1"> Phone Number </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
