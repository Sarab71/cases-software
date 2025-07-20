'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Item {
    modelNumber: string;
    quantity: number;
    rate: number;
    discount: number;
}

interface Bill {
    _id: string;
    invoiceNumber: number;
    items: Item[];
    customerId: string;
    date?: string;
}

interface EditBillFormProps {
    billId: string;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditBillForm({ billId, onClose, onUpdated }: EditBillFormProps) {
    const [bill, setBill] = useState<Bill | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [editDate, setEditDate] = useState<string>('');

    useEffect(() => {
        const fetchBill = async () => {
            const res = await fetch(`/api/bills/${billId}`);
            if (res.ok) {
                const data = await res.json();
                setBill(data);
                setItems(data.items);
                setEditDate(data.date ? data.date.split('T')[0] : '');
            }
        };

        fetchBill();
    }, [billId]);

    const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
        const updatedItems = [...items];

        if (field === 'modelNumber') {
            updatedItems[index][field] = String(value);
        } else {
            updatedItems[index][field] = Number(value);
        }

        setItems(updatedItems);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    const calculateNetAmount = (item: Item) => item.quantity * item.rate;
    const calculateTotalAmount = (item: Item) => {
        const netAmount = calculateNetAmount(item);
        return netAmount - (netAmount * (item.discount / 100));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch(`/api/bills/${billId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, date: editDate }),
        });

        if (res.ok) {
            toast.success('Bill updated successfully!');
            onClose();
            onUpdated();
        } else {
            toast.error('Failed to update bill.');
        }
    };

    const handleDeleteBill = async () => {
        if (!confirm('Are you sure you want to delete this bill?')) return;

        const res = await fetch(`/api/bills/${billId}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            toast.success('Bill deleted successfully!');
            onClose();
            onUpdated();
        } else {
            toast.error('Failed to delete bill.');
        }
    };

    if (!bill) return <p>Loading bill details...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border mt-4 rounded space-y-4">
            <h3 className="text-lg font-semibold">Editing Invoice #{bill.invoiceNumber}</h3>

            <div>
                <label className="block font-medium mb-1">Bill Date</label>
                <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Model Number</th>
                            <th className="border p-2">Quantity</th>
                            <th className="border p-2">Rate</th>
                            <th className="border p-2">Discount (%)</th>
                            <th className="border p-2">Net Amount</th>
                            <th className="border p-2">Total After Discount</th>
                            <th className="border p-2">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="border p-2">
                                    <input
                                        type="text"
                                        value={item.modelNumber}
                                        onChange={(e) => handleItemChange(index, 'modelNumber', e.target.value)}
                                        className="border p-1 rounded w-full"
                                        placeholder="Model Number"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="border p-1 rounded w-full"
                                        placeholder="Quantity"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                        className="border p-1 rounded w-full"
                                        placeholder="Rate"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                        className="border p-1 rounded w-full"
                                        placeholder="Discount %"
                                    />
                                </td>
                                <td className="border p-2 text-right">
                                    ₹ {calculateNetAmount(item).toFixed(2)}
                                </td>
                                <td className="border p-2 text-right">
                                    ₹ {calculateTotalAmount(item).toFixed(2)}
                                </td>
                                <td className="border p-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteItem(index)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                                        title="Delete Row"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:cursor-pointer">Update Bill</button>
                <button type="button" onClick={onClose} className="bg-gray-500 text-white px-3 py-1 rounded hover:cursor-pointer">Cancel</button>
                <button type="button" onClick={handleDeleteBill} className="bg-red-600 text-white px-3 py-1 rounded ml-auto hover:cursor-pointer">
                    Delete Bill
                </button>
            </div>
        </form>
    );
}