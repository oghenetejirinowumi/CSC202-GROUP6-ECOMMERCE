"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

type PaymentMethod = "card" | "bank_transfer";

const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const BANK_DETAILS = {
  bankName: "Teckvora Commerce Bank",
  accountName: "Teckvora Gadgets Ltd",
  accountNumber: "0123456789",
  sortCode: "058",
};

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition";

export default function PaymentPage() {
  const { cart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [transferReference, setTransferReference] = useState("");

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    // Template only — no real payment processing yet.
    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] py-16 px-6">
        <div className="max-w-xl mx-auto bg-white rounded-4xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Payment received
          </h1>
          <p className="text-gray-600 mb-2">
            This is a demo confirmation. No charge was made.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Method:{" "}
            <span className="font-semibold text-gray-800">
              {method === "card" ? "Debit / credit card" : "Bank transfer"}
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to checkout
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
            Payment
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Complete your payment
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Choose card payment or bank transfer. This page is a template and
            does not process real payments yet.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 w-fit">
          <Lock size={16} /> Secure payment form
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid xl:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Payment method
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  method === "card"
                    ? "border-black bg-gray-50 ring-2 ring-black/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={20} className="text-gray-700" />
                  <span className="font-semibold text-gray-900">
                    Card payment
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Visa, Mastercard, or Verve
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank_transfer")}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  method === "bank_transfer"
                    ? "border-black bg-gray-50 ring-2 ring-black/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building2 size={20} className="text-gray-700" />
                  <span className="font-semibold text-gray-900">
                    Bank transfer
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Pay manually to our account
                </p>
              </button>
            </div>
          </section>

          {method === "card" ? (
            <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Card details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your card information below.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Name on card
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
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
                    onChange={(event) =>
                      setCardNumber(formatCardNumber(event.target.value))
                    }
                    className={inputClass}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Expiry date
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(event) =>
                        setExpiry(formatExpiry(event.target.value))
                      }
                      className={inputClass}
                      placeholder="MM/YY"
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
                      onChange={(event) =>
                        setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className={inputClass}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <ShieldCheck size={14} />
                Card data is not stored. This form is for UI preview only.
              </p>
            </section>
          ) : (
            <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Bank transfer details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Transfer the order total, then enter your payment reference.
                  </p>
                </div>
              </div>

              <dl className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                {[
                  { label: "Bank", value: BANK_DETAILS.bankName },
                  { label: "Account name", value: BANK_DETAILS.accountName },
                  { label: "Account number", value: BANK_DETAILS.accountNumber },
                  { label: "Sort code", value: BANK_DETAILS.sortCode },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">
                        {label}
                      </dt>
                      <dd className="font-semibold text-gray-900">{value}</dd>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(label, value)}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Copy size={12} />
                      {copiedField === label ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </dl>

              <div className="mt-5">
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Transfer reference / receipt ID
                </label>
                <input
                  type="text"
                  value={transferReference}
                  onChange={(event) => setTransferReference(event.target.value)}
                  className={inputClass}
                  placeholder="e.g. TXN-20260524-001"
                  required
                />
              </div>
            </section>
          )}

          <button
            type="submit"
            disabled={submitting || subtotal === 0}
            className="w-full py-4 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitting
              ? "Processing..."
              : method === "card"
                ? `Pay ${currencyFormat.format(subtotal)}`
                : "Confirm transfer"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Demo template only — no payment gateway connected.
          </p>
        </form>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order summary</h3>

            {cart.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">
                Your cart is empty. Add items before paying.
              </p>
            ) : (
              <ul className="space-y-3 mb-4">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {currencyFormat.format(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-700">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {currencyFormat.format(subtotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="inline-block mt-5 text-sm font-semibold text-gray-900 underline underline-offset-4"
            >
              Back to checkout
            </Link>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Need help?</h3>
            <p className="text-sm text-gray-600">
              For payment issues, contact{" "}
              <a
                href="mailto:support@teckvora.com"
                className="font-semibold text-gray-900 underline underline-offset-2"
              >
                support@teckvora.com
              </a>{" "}
              with your order reference.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
