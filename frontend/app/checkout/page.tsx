"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { saveCheckoutDraft } from "../../lib/checkoutDraft";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:50000/api";

const SHIPPING_OPTIONS = {
  standard: {
    label: "Standard delivery",
    description: "3-5 business days",
    fee: 5000,
  },
  express: {
    label: "Express delivery",
    description: "Next business day in major cities",
    fee: 12000,
  },
} as const;

type PaymentChoice = "pay_on_delivery" | "pay_online";

const PAYMENT_CHOICES: Record<
  PaymentChoice,
  { label: string; description: string }
> = {
  pay_on_delivery: {
    label: "Pay on delivery",
    description: "Pay when your order arrives",
  },
  pay_online: {
    label: "Card or bank transfer",
    description: "Pay now on the next step with your card or bank transfer",
  },
};

type AddressForm = {
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyAddress = (): AddressForm => ({
  firstName: "",
  lastName: "",
  company: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nigeria",
});

const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function CheckoutPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { cart, currentOwnerId, refreshCart } = useCart();

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [shippingAddress, setShippingAddress] =
    useState<AddressForm>(emptyAddress);
  const [billingAddress, setBillingAddress] =
    useState<AddressForm>(emptyAddress);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] =
    useState<keyof typeof SHIPPING_OPTIONS>("standard");
  const [paymentChoice, setPaymentChoice] =
    useState<PaymentChoice>("pay_on_delivery");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    id: number;
    subtotal: number;
    shippingFee: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    setContactEmail((current) => current || user.email || "");
    setContactPhone((current) => current || user.phoneNumber || "");
    setShippingAddress((current) => ({
      ...current,
      firstName: current.firstName || user.firstName || "",
      lastName: current.lastName || user.lastName || "",
    }));
  }, [user]);

  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [billingSameAsShipping, shippingAddress]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const shippingFee = SHIPPING_OPTIONS[shippingMethod].fee;
  const taxAmount = 0;
  const total = subtotal + shippingFee + taxAmount;

  const updateAddress = (
    type: "shipping" | "billing",
    field: keyof AddressForm,
    value: string,
  ) => {
    if (type === "shipping") {
      setShippingAddress((current) => ({ ...current, [field]: value }));
      return;
    }

    setBillingAddress((current) => ({ ...current, [field]: value }));
  };

  const isAddressComplete = (address: AddressForm) =>
    Boolean(
      address.firstName &&
      address.lastName &&
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.postalCode &&
      address.country,
    );

  const validateCheckoutForm = () => {
    if (!cart.length) {
      setError("Your cart is empty.");
      return false;
    }

    if (!contactEmail || !contactPhone) {
      setError("Please provide your email address and phone number.");
      return false;
    }

    if (!isAddressComplete(shippingAddress)) {
      setError("Please complete your shipping address.");
      return false;
    }

    if (!billingSameAsShipping && !isAddressComplete(billingAddress)) {
      setError("Please complete your billing address.");
      return false;
    }

    return true;
  };

  const handleContinueToPayment = () => {
    setError(null);
    if (!validateCheckoutForm()) return;

    saveCheckoutDraft({
      owner_id: currentOwnerId,
      contact: { email: contactEmail, phone: contactPhone },
      shippingAddress,
      billingSameAsShipping,
      billingAddress,
      shippingMethod,
      deliveryNotes,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      subtotal,
      shippingFee,
      taxAmount,
      total,
    });

    router.push("/payment");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateCheckoutForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          owner_id: currentOwnerId,
          contact: {
            email: contactEmail,
            phone: contactPhone,
          },
          shippingAddress,
          billingSameAsShipping,
          billingAddress,
          shippingMethod,
          paymentMethod: "pay_on_delivery",
          deliveryNotes,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not place the order.");
        return;
      }

      setSuccess({
        id: data.order.id,
        subtotal: data.order.subtotal,
        shippingFee: data.order.shippingFee,
        total: data.order.total,
      });
      await refreshCart();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAddressFields = (
    type: "shipping" | "billing",
    values: AddressForm,
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          First name
        </label>
        <input
          value={values.firstName}
          onChange={(event) =>
            updateAddress(type, "firstName", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="John"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Last name
        </label>
        <input
          value={values.lastName}
          onChange={(event) =>
            updateAddress(type, "lastName", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="Doe"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Company (optional)
        </label>
        <input
          value={values.company}
          onChange={(event) =>
            updateAddress(type, "company", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="Business or apartment name"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Address line 1
        </label>
        <input
          value={values.addressLine1}
          onChange={(event) =>
            updateAddress(type, "addressLine1", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="Street address"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Address line 2 (optional)
        </label>
        <input
          value={values.addressLine2}
          onChange={(event) =>
            updateAddress(type, "addressLine2", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="Apartment, suite, landmark"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          City
        </label>
        <input
          value={values.city}
          onChange={(event) => updateAddress(type, "city", event.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="Lagos"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          State / Province
        </label>
        <input
          value={values.state}
          onChange={(event) => updateAddress(type, "state", event.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="Lagos State"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Postal code
        </label>
        <input
          value={values.postalCode}
          onChange={(event) =>
            updateAddress(type, "postalCode", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
          placeholder="100001"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Country / Region
        </label>
        <select
          value={values.country}
          onChange={(event) =>
            updateAddress(type, "country", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
        >
          <option>Nigeria</option>
          <option>Ghana</option>
          <option>Kenya</option>
          <option>South Africa</option>
          <option>United Kingdom</option>
          <option>United States</option>
          <option>Canada</option>
          <option>Other</option>
        </select>
      </div>
    </div>
  );

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700 text-lg font-semibold">
        Loading checkout...
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] py-16 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-4xl shadow-sm border border-gray-200 p-10 text-center">
          <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-5" />
          <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold mb-2">
            Order placed
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Thank you for your purchase
          </h1>
          <p className="text-gray-600 mb-1">Order #{success.id}</p>
          <p className="text-sm text-gray-500 mb-6">
            A confirmation email will be sent to the address you provided.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-left mb-8">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
                Subtotal
              </p>
              <p className="font-bold text-gray-900">
                {currencyFormat.format(success.subtotal)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
                Shipping
              </p>
              <p className="font-bold text-gray-900">
                {currencyFormat.format(success.shippingFee)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
                Total
              </p>
              <p className="font-bold text-gray-900">
                {currencyFormat.format(success.total)}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue shopping
            </Link>
            <Link
              href="/profile"
              className="px-6 py-3 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
            >
              View account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] py-16 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-4xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some products before heading to checkout.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
            Secure checkout
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Complete your order
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Enter your contact, delivery, and billing details to place your
            order.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 w-fit">
          <Lock size={16} /> SSL secured checkout
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid xl:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">
                <Mail size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Contact information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We’ll use these details for order updates and delivery
                  coordination.
                </p>
              </div>
            </div>

            {user && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-5 text-sm text-gray-700">
                Signed in as{" "}
                <span className="font-semibold text-gray-900">
                  {user.username}
                </span>
                . You can still edit your checkout contact details below.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
                    placeholder="+234 801 234 5678"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shipping address
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tell us where to deliver your order.
                </p>
              </div>
            </div>
            {renderAddressFields("shipping", shippingAddress)}
          </section>

          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery & payment
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose delivery speed and whether you’ll pay on delivery or
                  online on the next page.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                  Shipping method
                </p>
                <div className="space-y-3">
                  {Object.entries(SHIPPING_OPTIONS).map(([value, option]) => {
                    const checked = shippingMethod === value;
                    return (
                      <label
                        key={value}
                        className={`block rounded-2xl border p-4 cursor-pointer transition ${checked ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={checked}
                            onChange={() =>
                              setShippingMethod(
                                value as keyof typeof SHIPPING_OPTIONS,
                              )
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-gray-900">
                                {option.label}
                              </p>
                              <span className="font-bold text-gray-900">
                                {currencyFormat.format(option.fee)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                  Payment method
                </p>
                <div className="space-y-3">
                  {(
                    Object.entries(PAYMENT_CHOICES) as [
                      PaymentChoice,
                      (typeof PAYMENT_CHOICES)[PaymentChoice],
                    ][]
                  ).map(([value, option]) => {
                    const checked = paymentChoice === value;
                    return (
                      <label
                        key={value}
                        className={`block rounded-2xl border p-4 cursor-pointer transition ${checked ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentChoice"
                            checked={checked}
                            onChange={() => setPaymentChoice(value)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {option.label}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Billing details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set your billing address, order notes, and final preferences.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-3 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 mb-5">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={(event) =>
                  setBillingSameAsShipping(event.target.checked)
                }
              />
              Billing address is the same as shipping
            </label>

            {!billingSameAsShipping &&
              renderAddressFields("billing", billingAddress)}

            <div className="mt-6">
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Delivery notes (optional)
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(event) => setDeliveryNotes(event.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition resize-none"
                placeholder="Add delivery instructions, preferred contact time, or nearby landmarks"
              />
            </div>
          </section>
        </form>

        <aside className="xl:sticky xl:top-28 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-emerald-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order summary
                </h2>
                <p className="text-sm text-gray-500">
                  Review your basket before placing the order.
                </p>
              </div>
            </div>

            <ul className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-gray-500">
                      {item.brand} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {currencyFormat.format(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {currencyFormat.format(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-gray-900">
                  {currencyFormat.format(shippingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Taxes</span>
                <span className="font-semibold text-gray-900">
                  {currencyFormat.format(taxAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-700">
                  Total
                </span>
                <span className="text-2xl font-extrabold text-gray-900">
                  {currencyFormat.format(total)}
                </span>
              </div>
            </div>

            {paymentChoice === "pay_on_delivery" ? (
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="w-full mt-6 py-4 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Placing order..." : "Place order"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={submitting}
                className="w-full mt-6 py-4 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Continue to payment
              </button>
            )}

            <p className="text-xs text-gray-500 text-center mt-3">
              By placing your order, you agree to our store terms, delivery
              policy, and payment instructions.
            </p>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Why shop with Teckvora
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />{" "}
                Secure checkout flow with server-side stock validation
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />{" "}
                Guest checkout supported with full delivery tracking contact
                fields
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />{" "}
                Flexible delivery options for urgent and standard orders
              </li>
            </ul>
            <Link
              href="/"
              className="inline-block mt-5 text-sm font-semibold text-gray-900 underline underline-offset-4"
            >
              Return to shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
