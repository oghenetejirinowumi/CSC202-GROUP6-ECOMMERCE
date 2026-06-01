export const CHECKOUT_DRAFT_KEY = "teckvora_checkout_draft";

export type CheckoutAddress = {
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

export type CheckoutDraft = {
  owner_id: string | null;
  contact: { email: string; phone: string };
  shippingAddress: CheckoutAddress;
  billingSameAsShipping: boolean;
  billingAddress: CheckoutAddress;
  shippingMethod: string;
  deliveryNotes: string;
  items: { product_id: string; quantity: number }[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
};

export function saveCheckoutDraft(draft: CheckoutDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
}
