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

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await fetch(`/api/payments/${paymentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPayment(data);
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
                onUpdated();   // Refresh statement
                onClose();     // Close the form
            } else {
                toast.error('Failed to delete payment.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error deleting payment.');
        }
    };

    if (loading) return <p>Loading payment details...</p>;
    if (!payment) return <p>Payment not found.</p>;

    return (
        <div className="p-4 bg-gray-50 border mt-4 rounded space-y-4">
            <h3 className="text-lg font-semibold mb-2">Editing Payment</h3>

            <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ₹ {payment.amount.toFixed(2)}</p>

            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                >
                    Delete Payment
                </button>
                <button
                    onClick={onClose}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
