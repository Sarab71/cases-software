'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Item {
  modelNumber: string;
  quantity: number | string;
  rate: number | string;
  discount: number | string;
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
  const [items, setItems] = useState<Item[]>([
    { modelNumber: '', quantity: '', rate: '', discount: '' },
  ]);

  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data));

    fetch('/api/bills/last')
      .then(res => res.json())
      .then(data => {
        setInvoiceNumber(data.lastInvoice ? data.lastInvoice + 1 : 1001);
      });
  }, []);

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearch(term);
    setSelectedIndex(-1); // reset index on input

    if (term.trim() === '') {
      setFilteredCustomers([]);
    } else {
      const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleCustomerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); // prevent cursor jump
      setSelectedIndex((prev) => (prev < filteredCustomers.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();  // ✅ prevents form submit
      if (selectedIndex >= 0 && selectedIndex < filteredCustomers.length) {
        handleSelectCustomer(filteredCustomers[selectedIndex]);
      }
    }
  };


  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setFilteredCustomers([]);
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value as never;
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer before creating the bill');
      return;
    }

    try {
      const processedItems = items.map(item => {
        const quantity = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;
        const discount = Number(item.discount) || 0;

        const discountAmount = (rate * discount) / 100;
        const netAmount = rate - discountAmount;
        const totalAmount = netAmount * quantity;

        return {
          ...item,
          netAmount,
          totalAmount,
        };
      });

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          customerId: selectedCustomer._id,
          items: processedItems,
          date: billDate, // <-- add date here
        }),
      });

      if (res.ok) {
        toast.success('Bill created successfully');
        await fetchLatestInvoiceNumber();
        resetForm();
        setBillDate(new Date().toISOString().split('T')[0]);
      } else {
        toast.error('Failed to create bill');
      }
    } catch {
      toast.error('An error occurred while creating the bill');
    }
  };


  const fetchLatestInvoiceNumber = async () => {
    const res = await fetch('/api/bills/last');
    const data = await res.json();
    setInvoiceNumber(data.lastInvoice ? data.lastInvoice + 1 : 1001);
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

  // Process items to include netAmount and totalAmount
  const processedItems = items.map(item => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;

    const discountAmount = (rate * discount) / 100;
    const netAmount = rate - discountAmount;
    const totalAmount = netAmount * quantity;

    return {
      ...item,
      netAmount: netAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  });

  const res = await fetch('/api/bills/generate-pdf', {
    method: 'POST',
    body: JSON.stringify({
      invoiceNumber,
      customer: selectedCustomer,
      items: processedItems,
      grandTotal: Math.round(grandTotal),
      date: new Date().toLocaleDateString(),
    }),
    headers: { 'Content-Type': 'application/json' }
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



  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Create Bill</h2>

      <div>
        <label>Invoice Number</label>
        <input
          value={invoiceNumber}
          readOnly
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>


      <div>
        <label>Date</label>
        <input
          type="date"
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="relative">
        <label>Search Customer</label>
        <input
          type="text"
          value={customerSearch}
          onChange={handleCustomerSearch}
          onKeyDown={handleCustomerKeyDown}
          placeholder="Type customer name"
          className="w-full border p-2 rounded"
        />

        {filteredCustomers.length > 0 && (
          <ul className="absolute bg-white border rounded w-full mt-1 max-h-48 overflow-y-auto z-10">
            {filteredCustomers.map((customer, idx) => (
              <li
                key={customer._id}
                onClick={() => handleSelectCustomer(customer)}
                className={`p-2 cursor-pointer flex justify-between ${idx === selectedIndex ? 'bg-blue-100' : ''}`}
              >
                <span>{customer.name}</span>
                <span className="text-gray-500 text-sm">{customer.address}</span>
              </li>
            ))}
          </ul>

        )}
      </div>

      {selectedCustomer && (
        <div className="p-2 bg-gray-100 rounded">
          <strong>Selected Customer:</strong> {selectedCustomer.name} ({selectedCustomer.address})
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Model Number</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Discount (%)</th>
            <th className="border p-2">Net Price</th>
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
                <td className="border p-2">
                  <input
                    value={item.modelNumber}
                    onChange={(e) => handleItemChange(index, 'modelNumber', e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border p-2 text-center">{netPrice.toFixed(2)}</td>
                <td className="border p-2 text-center">{totalAmount.toFixed(2)}</td>
              </tr>
            );
          })}

        </tbody>
      </table>

      <button
        type="button"
        onClick={handleAddItem}
        className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
      >
        + Add Item
      </button>

      <div className="mt-4 text-right font-semibold text-lg">
        Grand Total: ₹{Math.round(grandTotal)}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer"
        >
          Create Bill
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 cursor-pointer"
        >
          Export as PDF
        </button>
      </div>
    </form>
  );
}
