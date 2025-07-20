import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md p-4 flex justify-center items-center">
      <nav className="space-x-4 flex justify-center">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/add-customer" className="hover:underline">Add Customer</Link>
        <Link href="/add-payment" className="hover:underline">Add Payment</Link>
        <Link href="/create-bill" className="hover:underline">Create Bill</Link>
        <Link href="/customers" className="hover:underline">Customers</Link>
      </nav>
    </header>
  );
}