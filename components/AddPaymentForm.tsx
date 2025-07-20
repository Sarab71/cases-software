'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function AddPaymentForm() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        toast.error('Failed to load customers.');
      }
    };
    fetchCustomers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredCustomers.length) {
        handleSelectCustomer(filteredCustomers[selectedIndex]);
      }
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setFilteredCustomers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer.');
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          amount: Number(amount),
          date, // send date
        }),
      });

      if (response.ok) {
        toast.success('Payment added successfully!');
        setSelectedCustomer(null);
        setSearchTerm('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add payment.');
      }
    } catch (err) {
      toast.error('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4 relative">
      <h2 className="text-xl font-bold mb-2">Add Payment</h2>

      <div className="relative">
        <label className="block font-medium">Search Customer</label>
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Start typing customer name"
          className="w-full border rounded p-2"
        />

        {filteredCustomers.length > 0 && (
          <ul className="absolute z-10 w-full border border-gray-300 rounded mt-1 bg-white max-h-40 overflow-y-auto shadow">
            {filteredCustomers.map((customer, index) => (
              <li
                key={customer._id}
                className={`p-2 cursor-pointer ${
                  index === selectedIndex ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectCustomer(customer)}
              >
                {customer.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border rounded p-2"
          max={new Date().toISOString().split('T')[0]}
        />
        <span className="text-xs text-gray-500">Leave blank for today</span>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Add Payment
      </button>
    </form>
  );
}