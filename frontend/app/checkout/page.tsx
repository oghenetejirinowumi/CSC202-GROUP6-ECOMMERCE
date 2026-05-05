import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const CheckoutPage = () => {
    return (
        <div className="max-w-2xl mx-auto px-6 py-10">

            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {/* Empty state */}
            <div className="border rounded-lg p-6 mb-6 flex flex-col items-center justify-center py-16 text-gray-400">
                <ShoppingCart size={48} />
                <p className="mt-4 text-lg">No items added</p>
                <Link href="/" className="mt-4 text-blue-600 hover:underline text-sm">
                    Continue Shopping
                </Link>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t pt-4 mb-6">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-bold">$0.00</span>
            </div>

            {/* Proceed to Pay */}
            <button
                disabled
                className="w-full py-4 rounded-lg text-white font-semibold text-lg bg-gray-300 cursor-not-allowed"
            >
                Proceed to Pay
            </button>

        </div>
    );
};

export default CheckoutPage;