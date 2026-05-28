'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url(/images/download.webp)',  // Changed here
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay (optional) */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative text-center space-y-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          Teckvora
        </h1>
        <p className="text-xl text-gray-200 mb-12">
          Welcome to your favorite tech store
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <button className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-full hover:bg-slate-600 transition">
              Sign In
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-500 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}