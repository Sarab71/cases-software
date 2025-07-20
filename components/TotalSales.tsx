'use client';

import { useEffect, useState } from 'react';

export default function TotalSales() {
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            const res = await fetch('/api/transactions?type=debit');
            if (res.ok) {
                const transactions = await res.json();
                const sum = transactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
                setTotal(sum);
            }
        }
        fetchTotal();
    }, []);

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h3 className="font-semibold mb-2">Total Sales</h3>
            <div className="text-2xl font-bold text-blue-600">
                ₹ {total !== null ? total.toLocaleString() : '...'}
            </div>
        </div>
    );
}