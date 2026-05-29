// frontend/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User as UserIcon, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  // Global View States
  const [user, setUser] = useState<any>(null);
  const [isLoginView, setIsLoginView] = useState(false); // Default: Show Sign Up first
  const [loading, setLoading] = useState(false);

  // Form Field Tracking Variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check for an active login session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("teckvora_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 1. POST: Authentication Handler (Sign In Engine)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both your email address and password profile.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:50000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("teckvora_user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        alert(data.error || "Invalid sign-in credentials.");
      }
    } catch (err) {
      alert("Could not connect to authentication services.");
    } finally {
      setLoading(false);
    }
  };

  // 2. POST: Registration Handler (Sign Up Engine)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !username || !password || !phoneNumber || !birthday) {
      alert("Please complete all mandatory field verification paths.");
      return;
    }

    setLoading(true);
    try {
      // Combines tracking elements for registration processing pools
      const res = await fetch("http://localhost:50000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          // Metadata package payload block ready for your teammate's email handler scripts
          meta: { firstName, lastName, phoneNumber, birthday } 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Account setup completed! Proceeding to account sign-in step.");
        setIsLoginView(true); // Toggle to login view
        setPassword("");
      } else {
        alert(data.error || "Registration validation error encountered.");
      }
    } catch (err) {
      alert("Database link connection refused by background server nodes.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teckvora_user");
    setUser(null);
    setIsLoginView(false);
  };

  // Styles configuration classes
  const inputContainerClass = "relative w-full mb-4";
  const labelClass = "block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400";
  const fieldInputClass = "w-full pl-4 pr-12 py-3 bg-[#1E293B] border border-slate-700 rounded-xl text-white outline-none focus:border-slate-400 transition-all text-sm shadow-inner";

  // --- VIEW CONDITION A: USER IS LOGGED IN ---
  if (user) {
    return (
      <div className="min-h-screen bg-[#0F172A] py-16 px-6">
        <div className="max-w-2xl mx-auto bg-[#1E293B] rounded-3xl p-8 border border-slate-800 shadow-2xl text-white">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
              <UserIcon size={40} className="text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{user.username}</h1>
              <p className="text-sm text-slate-400 font-medium">Customer Session Account Dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-slate-800 flex items-center gap-3">
              <Mail className="text-slate-500" size={20} />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Email Address</p>
                <p className="text-sm font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="text-slate-500" size={20} />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Account Status</p>
                <p className="text-sm font-semibold text-emerald-400">Verified Client</p>
              </div>
            </div>
          </div>

          {/* This empty placeholder section is ready for your team members to add things like past orders later */}
          <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500 mb-8 font-medium text-sm">
            No recent transaction history recorded in this account branch block.
          </div>

          <button
            onClick={handleLogout}
            className="w-full md:w-auto px-8 py-3 bg-red-600/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all text-sm cursor-pointer"
          >
            Sign Out of Session
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW CONDITION B: INTERACTIVE REGISTRATION GATEWAY ---
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-16 px-6">
      <div className="max-w-160 w-full mx-auto bg-[#1E293B] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase">
            {isLoginView ? "Sign In" : "Sign Up"}
          </h2>
          <p className="text-slate-400 text-xl mt-1.5 font-medium">
            {isLoginView ? "Welcome back to Teckvora systems" : "Sign up now and get the best deals on all gadgets!"}
          </p>
        </div>

        {isLoginView ? (
          // LOGIN VIEW CARD
          <form onSubmit={handleLogin} className="space-y-4">
            <div className={inputContainerClass}>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldInputClass}
                placeholder="name@example.com"
              />
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Password Profile</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldInputClass}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition-all text-sm shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating Data..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
              Dont have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsLoginView(false); setShowPassword(false); }}
                className="text-white underline font-bold"
              >
                Sign Up Here
              </button>
            </p>
          </form>
        ) : (
          // SIGN UP VIEW CARD
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={inputContainerClass}>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldInputClass}
                  placeholder="John"
                />
              </div>
              <div className={inputContainerClass}>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldInputClass}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldInputClass}
                placeholder="john.doe@gmail.com"
              />
            </div>

            {/* <div className={inputContainerClass}>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={fieldInputClass}
                placeholder="johndoe"
              />
            </div> */}

            <div className="grid grid-cols-2 gap-4">
              <div className={inputContainerClass}>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={fieldInputClass}
                  placeholder="+234..."
                />
              </div>
              <div className={inputContainerClass}>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className={`${fieldInputClass} uppercase tracking-wider text-xs text-slate-400`}
                />
              </div>
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldInputClass}
                placeholder="Choose strong password"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldInputClass}
                placeholder="Comfirm password"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition-all text-sm shadow-md disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? "Processing Registration Securely..." : "Create Account"}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
              Already have an active account configuration?{" "}
              <button
                type="button"
                onClick={() => { setIsLoginView(true); setShowPassword(false); }}
                className="text-white underline font-bold"
              >
                Sign In Instead
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}