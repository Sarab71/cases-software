'use client';

import { useEffect, useState, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { toast } from 'react-toastify';

interface Item {
  modelNumber: string;
  quantity: string;
  rate: string;
  discount: string;
}

interface Customer {
  _id: string;
  name: string;
  address: string;
}

export default function CreateBillForm() {
  const [billDate, setBillDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<number>(1001);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Item[]>([{ modelNumber: '', quantity: '', rate: '', discount: '' }]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    fetchCustomers();
    fetchLatestInvoiceNumber();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data: Customer[] = await res.json();
    setCustomers(data);
  };

  const fetchLatestInvoiceNumber = async () => {
    const res = await fetch('/api/bills/last');
    const data = await res.json();
    setInvoiceNumber(data.lastInvoice ? data.lastInvoice + 1 : 1001);
  };

  const handleCustomerSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearch(term);
    setSelectedIndex(-1);

    if (!term.trim()) {
      setFilteredCustomers([]);
      return;
    }

    setFilteredCustomers(
      customers.filter((c) => c.name.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const handleCustomerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCustomers.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectCustomer(filteredCustomers[selectedIndex]);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setFilteredCustomers([]);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  const calculateGrandTotal = (itemsList: Item[]) => {
    const total = itemsList.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;

      const discountAmount = (rate * discount) / 100;
      const netPrice = rate - discountAmount;
      return sum + netPrice * quantity;
    }, 0);
    setGrandTotal(Math.round(total));
  };

  const handleAddItem = () => {
    setItems([...items, { modelNumber: '', quantity: '', rate: '', discount: '' }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Please select a customer before creating the bill');
      return;
    }

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          customerId: selectedCustomer._id,
          items,
          date: billDate,
        }),
      });

      if (res.ok) {
        toast.success('Bill created successfully');
        fetchLatestInvoiceNumber();
        resetForm();
        setBillDate(new Date().toISOString().split('T')[0]);
      } else {
        toast.error('Failed to create bill');
      }
    } catch {
      toast.error('An error occurred while creating the bill');
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setItems([{ modelNumber: '', quantity: '', rate: '', discount: '' }]);
    setGrandTotal(0);
  };

  const downloadPdf = async () => {
    if (!selectedCustomer) {
      toast.error('Please select customer first');
      return;
    }

    const res = await fetch('/api/bills/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceNumber,
        customer: selectedCustomer,
        items,
        grandTotal,
        date: new Date().toLocaleDateString(),
      }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      toast.error('Failed to generate PDF');
    }
  };
  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded space-y-6">
      <h2 className="text-2xl font-bold text-center">Create Bill</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Invoice Number</label>
          <input
            value={invoiceNumber}
            readOnly
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Bill Date</label>
          <input
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Search Customer</label>
        <input
          type="text"
          value={customerSearch}
          onChange={handleCustomerSearch}
          onKeyDown={handleCustomerKeyDown}
          placeholder="Type customer name"
          className="w-full border p-2 rounded"
        />

        {filteredCustomers.length > 0 && (
          <ul className="bg-white border rounded mt-1 max-h-48 overflow-y-auto">
            {filteredCustomers.map((customer, idx) => (
              <li
                key={customer._id}
                onClick={() => handleSelectCustomer(customer)}
                className={`p-2 cursor-pointer ${idx === selectedIndex ? 'bg-blue-100' : ''}`}
              >
                {customer.name} - {customer.address}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedCustomer && (
        <div className="p-2 bg-gray-100 rounded border">
          <strong>Selected Customer:</strong> {selectedCustomer.name} ({selectedCustomer.address})
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300 mt-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Model</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Disc%</th>
            <th className="border p-2">Net</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const discount = Number(item.discount) || 0;

            const discountAmount = (rate * discount) / 100;
            const netPrice = rate - discountAmount;
            const totalAmount = netPrice * quantity;

            return (
              <tr key={index}>
                <td className="border p-1">
                  <input
                    value={item.modelNumber}
                    onChange={(e) => handleItemChange(index, 'modelNumber', e.target.value)}
                    className="w-full border p-1 rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full border p-1 rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-full border p-1 rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                    className="w-full border p-1 rounded"
                  />
                </td>
                <td className="border p-1 text-center">{netPrice.toFixed(2)}</td>
                <td className="border p-1 text-center">{totalAmount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
        >
          + Add Item
        </button>

        <button
          type="button"
          onClick={() => {
            if (items.length > 1) {
              const updatedItems = items.slice(0, -1);
              setItems(updatedItems);
              calculateGrandTotal(updatedItems);
            }
          }}
          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
        >
          - Delete Last Item
        </button>
      </div>

      <div className="mt-4 text-right font-semibold text-lg">
        Grand Total: ₹{Math.round(grandTotal)}
      </div>

      <div className="flex gap-2 justify-end">
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
          Create Bill
        </button>
        <button type="button" onClick={downloadPdf} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Export as PDF
        </button>
      </div>
    </form>
  );

}
