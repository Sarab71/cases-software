'use client';

import { useEffect, useState } from 'react';

interface Transaction {
    _id: string;
    date: string;
    type: 'debit' | 'credit';
    amount: number;
    description: string;
    relatedBillId?: string;
    invoiceNumber?: number;
    particulars?: string;
    debit?: number;
    credit?: number;
    balance: number;
}

interface Props {
    customerId: string;
    customerName: string;
}

export default function CustomerStatement({ customerId, customerName }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`/api/customers/${customerId}/statement`);
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data);
                }
            } catch (err) {
                console.error('Failed to fetch transactions', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [customerId]);

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Statement of {customerName}</h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Particulars</th>
                            <th className="border p-2 text-right">Debit (₹)</th>
                            <th className="border p-2 text-right">Credit (₹)</th>
                            <th className="border p-2 text-right">Balance (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn, index) => {
                            const date = new Date(txn.date).toLocaleDateString();
                            const debit = txn.debit ? Number(txn.debit).toFixed(2) : '';
                            const credit = txn.credit ? Number(txn.credit).toFixed(2) : '';
                            const balance = Number(txn.balance).toFixed(2);

                            return (
                                <tr key={txn._id || index}>
                                    <td className="border p-2">{date}</td>
                                    <td className="border p-2">{txn.particulars}</td>
                                    <td className="border p-2 text-right">{debit}</td>
                                    <td className="border p-2 text-right">{credit}</td>
                                    <td className="border p-2 text-right">{balance}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
