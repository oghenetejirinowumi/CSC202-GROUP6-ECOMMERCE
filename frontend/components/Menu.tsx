"use client";

import { useState } from "react";
import { X, ChevronDown, Smartphone, Monitor, Tv, Home, Star } from "lucide-react";

interface SubCategory {
    name: string;
}

interface Category {
    id: number;
    name: string;
    icon: React.ReactNode;
    subcategories: SubCategory[];
}

const categories: Category[] = [
    {
        id: 1,
        name: "Mobile & Wearables",
        icon: <Smartphone size={18} />,
        subcategories: [
            { name: "Smartphones" },
            { name: "Tablets" },
            { name: "Smartwatches" },
            { name: "Audio" },
        ],
    },
    {
        id: 2,
        name: "Computing & Gaming",
        icon: <Monitor size={18} />,
        subcategories: [
            { name: "Laptops" },
            { name: "Desktop PCs" },
            { name: "Gaming" },
            { name: "Accessories" },
        ],
    },
    {
        id: 3,
        name: "Home Entertainment",
        icon: <Tv size={18} />,
        subcategories: [
            { name: "Televisions" },
            { name: "Home Theater" },
            { name: "Streaming" },
        ],
    },
    {
        id: 4,
        name: "Smart Home & Photography",
        icon: <Home size={18} />,
        subcategories: [
            { name: "Cameras" },
            { name: "Smart Home" },
            { name: "Office" },
        ],
    },
    {
        id: 5,
        name: "Miscellaneous",
        icon: <Star size={18} />,
        subcategories: [
            { name: "Wishlist Items" },
            { name: "Featured Deals" },
        ],
    },
];

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: MenuDrawerProps) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleCategory = (id: number) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    return (
        <>
            {/* BACKDROP */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* DRAWER */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* DRAWER HEADER */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200">
                    <span className="text-lg font-extrabold tracking-tight text-gray-900">
                        Categories
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* CATEGORY LIST */}
                <nav className="flex-1 overflow-y-auto py-3 px-3">
                    {categories.map((category) => (
                        <div key={category.id} className="mb-1">
                            {/* CATEGORY BUTTON */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {category.icon}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                                        {category.name}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-400 transition-transform duration-200 ${
                                        expandedId === category.id ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* SUBCATEGORIES */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    expandedId === category.id
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                }`}
                            >
                                <ul className="ml-4 mt-1 mb-1 border-l border-gray-200 pl-3 space-y-0.5">
                                    {category.subcategories.map((sub) => (
                                        <li key={sub.name}>
                                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                                {sub.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </nav>

                {/* DRAWER FOOTER */}
                <div className="border-t border-gray-200 px-4 py-4">
                    <p className="text-xs text-gray-400 text-center">TechMart © 2025</p>
                </div>
            </aside>
        </>
    );
};

export default MenuDrawer;