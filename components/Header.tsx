import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Billing System</h1>
      <nav className="space-x-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/add-customer" className="hover:underline">Add Customer</Link>
        <Link href="/add-payment" className="hover:underline">Add Payment</Link>
        <Link href="/create-bill" className="hover:underline">Create Bill</Link>
        <Link href="/customers" className="hover:underline">Customers</Link>
      </nav>
    </header>
  );
}
