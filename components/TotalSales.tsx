'use client';

import { useEffect, useState } from 'react';

interface TotalSalesProps {
    startDate?: string;
    endDate?: string;
}

export default function TotalSales({ startDate = '', endDate = '' }: TotalSalesProps) {
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            const params = new URLSearchParams();
            params.append('type', 'debit');
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`/api/transactions?${params.toString()}`);
            if (res.ok) {
                const transactions = await res.json();
                const sum = transactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
                setTotal(sum);
            }
        }
        fetchTotal();
    }, [startDate, endDate]);

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h3 className="font-semibold mb-2">Total Sales</h3>
            <div className="text-2xl font-bold text-blue-600">
                ₹ {total !== null ? total.toLocaleString() : '...'}
            </div>
        </div>
    );
}