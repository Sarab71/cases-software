'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function AddCustomerForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address }),
      });

      if (response.ok) {
        toast.success('Customer added successfully!');
        setName('');
        setPhone('');
        setAddress('');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add customer.');
      }
    } catch (err) {
      toast.error('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold mb-2">Add Customer</h2>

      <div>
        <label className="block font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-medium">Phone</label>
        <input
          type="text"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-medium">Address</label>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 cursor-pointer"
      >
        Add Customer
      </button>
    </form>
  );
}
