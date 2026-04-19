import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="text-xl font-bold">
        <Link href="/">Logo</Link>
      </div>
      <div className="space-x-4">
        <Link href="/cart" className="hover:text-blue-500">Cart</Link>
        <Link href="/profile(account-details)" className="hover:text-blue-500">Profile</Link>
      </div>
    </nav>
  );
}
