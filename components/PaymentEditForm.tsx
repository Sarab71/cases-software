'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Payment {
    _id: string;
    date: string;
    amount: number;
    description: string;
}

interface PaymentEditFormProps {
    paymentId: string;
    onClose: () => void;
    onUpdated: () => void;
}

export default function PaymentEditForm({ paymentId, onClose, onUpdated }: PaymentEditFormProps) {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [editAmount, setEditAmount] = useState<string>('');
    const [editDate, setEditDate] = useState<string>('');

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await fetch(`/api/payments/${paymentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPayment(data);
                    setEditAmount(data.amount.toString());
                    setEditDate(data.date ? data.date.split('T')[0] : '');
                } else {
                    toast.error('Failed to load payment details.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Error fetching payment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [paymentId]);

    const handleDelete = async () => {
        if (!payment) return;

        const confirmDelete = confirm('Are you sure you want to delete this payment?');
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Payment deleted successfully!');
                onUpdated();
                onClose();
            } else {
                toast.error('Failed to delete payment.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error deleting payment.');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        try {
            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(editAmount),
                    date: editDate,
                }),
            });

            if (res.ok) {
                toast.success('Payment updated successfully!');
                onUpdated();
                onClose();
            } else {
                toast.error('Failed to update payment.');
            }
        } catch (err) {
            toast.error('Error updating payment.');
        }
    };

    if (loading) return <p>Loading payment details...</p>;
    if (!payment) return <p>Payment not found.</p>;

    return (
        <form onSubmit={handleUpdate} className="p-4 bg-gray-50 border mt-4 rounded space-y-4">
            <h3 className="text-lg font-semibold mb-2">Edit Payment</h3>

            <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="border p-2 rounded w-full"
                    max={new Date().toISOString().split('T')[0]}
                    required
                />
            </div>
            <div>
                <label className="block font-medium mb-1">Amount</label>
                <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                />
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:cursor-pointer"
                >
                    Update Payment
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:cursor-pointer"
                >
                    Delete Payment
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}