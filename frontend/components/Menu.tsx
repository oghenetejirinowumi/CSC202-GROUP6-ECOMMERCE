"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Smartphone, Monitor, Tv, Home, Star, ChevronDown, ChevronUp } from "lucide-react";

const categories = [
    {
        name: "Mobile & Wearables",
        icon: <Smartphone size={20} />,
        subcategories: ["Phones", "Tablets", "Wearables"],
    },
    {
        name: "Computing & Gaming",
        icon: <Monitor size={20} />,
        subcategories: ["Laptops", "Desktops", "Gaming"],
    },
    {
        name: "Home Entertainment",
        icon: <Tv size={20} />,
        subcategories: ["TVs", "Audio", "Streaming"],
    },
    {
        name: "Smart Home & Photography",
        icon: <Home size={20} />,
        subcategories: ["Cameras", "Smart Home", "Office"],
    },
    {
        name: "Miscellaneous",
        icon: <Star size={20} />,
        subcategories: ["Accessories", "Other"],
    },
];

// isOpen and onClose come from Navbar.tsx
const MenuDrawer = ({ isOpen, onClose }) => {
    const [openCategory, setOpenCategory] = useState(null);

    const toggleCategory = (name) => {
        setOpenCategory(openCategory === name ? null : name);
    };

    return (
        <>
            {/* Overlay — dark background behind drawer */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Drawer Panel */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Categories</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-200 p-1 rounded-md"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Categories List */}
                <ul className="p-4">
                    {categories.map((cat) => (
                        <li key={cat.name} className="mb-2">

                            {/* Category Button */}
                            <button
                                onClick={() => toggleCategory(cat.name)}
                                className="flex items-center justify-between w-full px-2 py-3 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <div className="flex items-center gap-3 text-gray-700">
                                    {cat.icon}
                                    <span className="font-medium">{cat.name}</span>
                                </div>
                                {openCategory === cat.name ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {/* Subcategories — only shows when category is open */}
                            {openCategory === cat.name && (
                                <ul className="ml-10 border-l pl-4 mt-1">
                                    {cat.subcategories.map((sub) => (
                                        <li key={sub}>
                                            <Link
                                                href={`/${sub.toLowerCase().replace(" ", "-")}`}
                                                className="block py-2 text-gray-500 hover:text-black transition-colors"
                                                onClick={onClose}
                                            >
                                                {sub}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default MenuDrawer;