"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:50000/api";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("This verification link is missing a token.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();
        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Could not verify your email.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch {
        setStatus("error");
        setMessage("Could not connect to the server.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
        <p
          className={`text-sm uppercase tracking-[0.3em] font-semibold mb-3 ${status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-gray-500"}`}
        >
          {status === "success"
            ? "Verified"
            : status === "error"
              ? "Verification failed"
              : "Please wait"}
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Email verification
        </h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <Link
          href="/profile?mode=login"
          className="inline-flex px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-16 px-6 flex items-center justify-center text-gray-700 text-lg font-semibold">
          Loading verification...
        </div>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
