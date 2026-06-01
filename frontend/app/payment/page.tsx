"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Lock,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  type CheckoutDraft,
} from "../../lib/checkoutDraft";

type PaymentMethod = "card" | "bank_transfer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:50000/api";

const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const BANK = {
  name: "Guaranty Trust Bank (GTBank)",
  accountNumber: "0123456789",
  accountName: "Teckvora Gadgets Ltd",
};

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition";

export default function PaymentPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    const saved = loadCheckoutDraft();
    if (!saved || !saved.items.length) {
      router.replace("/checkout");
      return;
    }
    setDraft(saved);
    setReady(true);
  }, [router]);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(BANK.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const placeOrder = async (paymentMethod: PaymentMethod) => {
    if (!draft) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          owner_id: draft.owner_id,
          contact: draft.contact,
          shippingAddress: draft.shippingAddress,
          billingSameAsShipping: draft.billingSameAsShipping,
          billingAddress: draft.billingAddress,
          shippingMethod: draft.shippingMethod,
          paymentMethod,
          deliveryNotes: draft.deliveryNotes,
          items: draft.items,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not place the order.");
        return;
      }

      clearCheckoutDraft();
      await refreshCart();
      setOrderId(data.order?.id ?? null);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await new Promise((r) => window.setTimeout(r, 600));
    await placeOrder("card");
  };

  const handleTransferConfirm = async () => {
    await placeOrder("bank_transfer");
  };

  if (!ready || !draft) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center text-gray-600">
        Loading payment...
      </div>
    );
  }

  if (orderId !== null) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] py-16 px-6">
        <div className="max-w-lg mx-auto bg-white rounded-4xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Order placed
          </h1>
          <p className="text-gray-600 mb-1">
            {method === "card"
              ? "Your card payment was recorded (demo — no real charge)."
              : "We’ll verify your bank transfer and confirm your order."}
          </p>
          {orderId > 0 && (
            <p className="text-sm text-gray-500 mb-8">Order #{orderId}</p>
          )}
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
          Step 2 of 2
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Payment
        </h1>
        <p className="text-gray-600 mt-2">
          Your delivery details are saved. Choose card or bank transfer to
          complete your order.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8 rounded-4xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How are you paying?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`rounded-2xl border p-4 text-left transition ${
                method === "card"
                  ? "border-black bg-gray-50 ring-2 ring-black/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CreditCard size={22} className="text-gray-700 mb-2" />
              <p className="font-semibold text-gray-900">Card</p>
              <p className="text-sm text-gray-500 mt-1">Debit or credit card</p>
            </button>

            <button
              type="button"
              onClick={() => setMethod("bank_transfer")}
              className={`rounded-2xl border p-4 text-left transition ${
                method === "bank_transfer"
                  ? "border-black bg-gray-50 ring-2 ring-black/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Building2 size={22} className="text-gray-700 mb-2" />
              <p className="font-semibold text-gray-900">Bank transfer</p>
              <p className="text-sm text-gray-500 mt-1">Send money from your bank</p>
            </button>
          </div>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{currencyFormat.format(draft.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span>{currencyFormat.format(draft.shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-600 font-medium">Amount to pay</span>
            <span className="text-2xl font-extrabold text-gray-900">
              {currencyFormat.format(draft.total)}
            </span>
          </div>
        </div>

        {method === "card" ? (
          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8 rounded-4xl">
            <div className="flex items-center gap-2 mb-6 text-sm text-emerald-700">
              <Lock size={16} />
              <span>Enter your card details below</span>
            </div>

            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Name on card
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className={inputClass}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Card number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  className={inputClass}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className={inputClass}
                    placeholder="12/28"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className={inputClass}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-4 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting
                  ? "Placing order..."
                  : `Pay ${currencyFormat.format(draft.total)}`}
              </button>
            </form>
          </section>
        ) : (
          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8 rounded-4xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Transfer to this account
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Send exactly{" "}
              <strong className="text-gray-900">
                {currencyFormat.format(draft.total)}
              </strong>{" "}
              from your bank app, then confirm below.
            </p>

            <dl className="space-y-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Bank
                </dt>
                <dd className="text-lg font-semibold text-gray-900">{BANK.name}</dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Account number
                </dt>
                <dd className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold text-gray-900 tracking-wide">
                    {BANK.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Copy size={12} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Account name
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {BANK.accountName}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleTransferConfirm}
              disabled={submitting}
              className="w-full mt-6 py-4 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Placing order..." : "I've sent the money"}
            </button>
          </section>
        )}

        <p className="text-center">
          <Link
            href="/checkout"
            className="text-sm font-semibold text-gray-700 underline underline-offset-4"
          >
            Back to checkout
          </Link>
        </p>
      </div>
    </div>
  );
}
