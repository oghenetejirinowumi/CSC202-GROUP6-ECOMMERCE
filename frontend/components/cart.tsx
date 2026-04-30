"use client";

import { X, ShoppingCart } from "lucide-react";

const CartDrawer = ({ isOpen, onClose }) => {
    // this will later be replaced with real cart items
    const cartItems = [];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Drawer Panel — slides in from the RIGHT */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "translate-x-full"
            }`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Your Cart</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-200 p-1 rounded-md"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="p-4">
                    {cartItems.length === 0 ? (
                        // Empty cart message
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <ShoppingCart size={48} />
                            <p className="mt-4 text-lg">Your cart is empty</p>
                        </div>
                    ) : (
                        // Cart items will go here later
                        <ul>
                            {cartItems.map((item) => (
                                <li key={item.id}>{item.name}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer — Checkout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium">
                        Checkout
                    </button>
                </div>

            </div>
        </>
    );
};

export default CartDrawer;