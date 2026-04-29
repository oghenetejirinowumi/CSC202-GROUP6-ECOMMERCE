"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Links = [
    {href: "/", text: 'Home'},           // ✅ moved Home here
    {href: "/filter", text: 'Filter'},
    {href: "/sort", text: 'Sort'},
    {href: "/top-rated", text: 'Top-Rated'},
    {href: "/most-liked", text: 'Most Liked'},
];

const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="bg-gray-300 px-4 py-3">
            <div className="flex items-center gap-4">
                <ul className="flex items-center justify-between w-full">
                    {Links.map((link) => (
                        <li key={link.href} className="list-none">
                            <Link
                                href={link.href}
                                className={`px-3 py-2 rounded-md transition-colors ${
                                    pathname === link.href
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-200"
                                }`}
                            >
                                {link.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;