'use client';

import { useEffect, useState } from 'react';

export default function TotalOutstanding() {
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            const res = await fetch('/api/customers');
            if (res.ok) {
                const customers = await res.json();
                const sum = customers.reduce((acc: number, c: any) => acc + (c.balance || 0), 0);
                setTotal(sum);
            }
        }
        fetchTotal();
    }, []);

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h3 className="font-semibold mb-2">Total Outstanding</h3>
            <div className="text-2xl font-bold text-red-600">
                ₹ {total !== null ? total.toLocaleString() : '...'}
            </div>
        </div>
    );
}