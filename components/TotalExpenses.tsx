'use client';

import { useEffect, useState } from 'react';

interface TotalExpensesProps {
    startDate?: string;
    endDate?: string;
}

export default function TotalExpenses({ startDate = '', endDate = '' }: TotalExpensesProps) {
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`/api/expenses/total?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTotal(data.totalExpenses);
            }
        }
        fetchTotal();
    }, [startDate, endDate]);

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h3 className="font-semibold mb-2">Total Expenses</h3>
            <div className="text-2xl font-bold text-orange-600">
                ₹ {total !== null ? total.toLocaleString() : '...'}
            </div>
        </div>
    );
}
