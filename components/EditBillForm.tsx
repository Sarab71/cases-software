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
}

interface EditBillFormProps {
    billId: string;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditBillForm({ billId, onClose, onUpdated }: EditBillFormProps) {
    const [bill, setBill] = useState<Bill | null>(null);
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const fetchBill = async () => {
            const res = await fetch(`/api/bills/${billId}`);
            if (res.ok) {
                const data = await res.json();
                setBill(data);
                setItems(data.items);
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
            body: JSON.stringify({ items }),
        });

        if (res.ok) {
            toast.success('Bill updated successfully!');
            onClose();
            onUpdated();
        } else {
            toast.error('Failed to update bill.');
        }
    };

    if (!bill) return <p>Loading bill details...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border mt-4 rounded space-y-4">
            <h3 className="text-lg font-semibold">Editing Invoice #{bill.invoiceNumber}</h3>

            {items.map((item, index) => (
                <div key={index} className="space-y-1 border-b pb-2 mb-2">
                    <div>
                        <label className="block text-sm font-medium">Model Number</label>
                        <input
                            type="text"
                            value={item.modelNumber}
                            onChange={(e) => handleItemChange(index, 'modelNumber', e.target.value)}
                            className="border p-1 rounded w-full"
                            placeholder="Model Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Quantity</label>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="border p-1 rounded w-full"
                            placeholder="Quantity"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Rate</label>
                        <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            className="border p-1 rounded w-full"
                            placeholder="Rate"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Discount (%)</label>
                        <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            className="border p-1 rounded w-full"
                            placeholder="Discount %"
                        />
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                        <p>Net Amount: ₹ {calculateNetAmount(item).toFixed(2)}</p>
                        <p>Total Amount after Discount: ₹ {calculateTotalAmount(item).toFixed(2)}</p>
                    </div>
                </div>
            ))}

            <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Update Bill</button>
                <button type="button" onClick={onClose} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
            </div>
        </form>
    );
}
