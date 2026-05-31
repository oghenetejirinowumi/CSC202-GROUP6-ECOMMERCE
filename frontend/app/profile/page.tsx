"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:50000/api";

const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

type Order = {
  id: number;
  total: number;
  status: string;
  date: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
};

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const requestedMode = useMemo(
    () => (searchParams.get("mode") === "login" ? "login" : "signup"),
    [searchParams],
  );

  const { user, initialized, login, logout, register, resendVerification } =
    useAuth();

  const [mode, setMode] = useState<"login" | "signup">(requestedMode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationIdentifier, setVerificationIdentifier] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  useEffect(() => {
    setMode(requestedMode);
  }, [requestedMode]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/my`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const resetFeedback = () => {
    setError(null);
    setMessage(null);
  };

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    resetFeedback();
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register({
      firstName,
      lastName,
      email,
      username,
      password,
      phoneNumber,
      birthday,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(result.data.message);
    setVerificationIdentifier(email);
    setIdentifier(email);
    setPassword("");
    setConfirmPassword("");
    switchMode("login");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (!identifier || !loginPassword) {
      setError("Please enter your email/username and password.");
      return;
    }

    setLoading(true);
    const result = await login({
      identifier,
      password: loginPassword,
      rememberMe,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      if (result.code === "EMAIL_NOT_VERIFIED") {
        setVerificationIdentifier(identifier);
      }
      return;
    }

    setVerificationIdentifier("");
    setLoginPassword("");
  };

  const handleResendVerification = async () => {
    resetFeedback();
    if (!verificationIdentifier) {
      setError("Enter your email or username first.");
      return;
    }

    setLoading(true);
    const result = await resendVerification(verificationIdentifier);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(result.data.message);
  };

  const handleLogout = async () => {
    await logout();
    switchMode("login");
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-[#cdcdcd] border-none rounded-lg outline-none text-gray-800 text-sm";
  const labelClass = "block mb-1 text-sm text-gray-700";

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-lg font-semibold">
        Loading account...
      </div>
    );
  }

  if (user) {
    return (
      <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
        <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
          My Account
        </h2>

        <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-4xl mx-auto mt-20">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="p-3 bg-gray-200 rounded-full">
              <UserIcon size={32} className="text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {user.firstName || user.username}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
              <Mail className="text-gray-400 shrink-0" size={16} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
              <ShieldCheck className="text-green-500 shrink-0" size={16} />
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">
                  Status
                </p>
                <p className="text-sm font-medium text-green-600">
                  {user.emailVerified ? "Verified" : "Pending verification"}
                </p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">
                Username
              </p>
              <p className="text-sm font-medium text-gray-800">
                {user.username}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-8">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                Full name
              </p>
              <p className="text-sm font-medium text-gray-800">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  "Not provided"}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800">
                {user.phoneNumber || "Not provided"}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Order History
            </p>
            {ordersLoading ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {currencyFormat.format(order.total)}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {order.items.map((item) => (
                        <li
                          key={`${order.id}-${item.productId}`}
                          className="flex justify-between gap-3"
                        >
                          <span>
                            {item.name}{" "}
                            <span className="text-gray-400">
                              × {item.quantity}
                            </span>
                          </span>
                          <span>
                            {currencyFormat.format(
                              item.priceAtPurchase * item.quantity,
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
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

  return (
    <div className="px-5 py-10 bg-[#0F172A] min-h-screen">
      <h2 className="text-center mt-16 text-5xl font-bold text-[#d9d9d9]">
        {mode === "login" ? "Sign In" : "Sign Up"}
      </h2>

      <div className="px-5 py-10 bg-[#f5f5f5] rounded-xl border border-[#cdcdcd99] max-w-135 mx-auto mt-20">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 px-4 py-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-4">
              <label className={labelClass}>Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className={inputClass}
                placeholder="you@example.com or johndoe"
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="mb-6 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Keep me signed in for 30 days
            </label>

            <button
              type="submit"
              disabled={loading}
              className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {verificationIdentifier && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="block mx-auto mt-4 text-sm text-[#0F172A] font-semibold underline disabled:opacity-50"
              >
                Resend verification email
              </button>
            )}

            <p className="text-center mt-6 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-[#0F172A] font-semibold underline hover:opacity-70 transition-opacity"
              >
                Create a new account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClass}
                  placeholder="John"
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
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
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
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
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className={inputClass}
                  placeholder="+234..."
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(event) => setBirthday(event.target.value)}
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
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
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
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block mx-auto px-12 py-3 bg-[#0F172A] text-white border-none rounded-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-[#0F172A] font-semibold underline hover:opacity-70 transition-opacity"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-lg font-semibold">
          Loading...
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
