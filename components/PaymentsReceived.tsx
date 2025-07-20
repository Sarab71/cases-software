'use client';

import { useEffect, useState } from 'react';

interface PaymentsReceivedProps {
    startDate?: string;
    endDate?: string;
}

interface Transaction {
    amount: number;
    // add other fields if needed
}

export default function PaymentsReceived({ startDate = '', endDate = '' }: PaymentsReceivedProps) {
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            const params = new URLSearchParams();
            params.append('type', 'credit');
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`/api/transactions?${params.toString()}`);
            if (res.ok) {
                const transactions: Transaction[] = await res.json();
                const sum = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
                setTotal(sum);
            }
        }
        fetchTotal();
    }, [startDate, endDate]);

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h3 className="font-semibold mb-2">Payments Received</h3>
            <div className="text-2xl font-bold text-green-600">
                ₹ {total !== null ? total.toLocaleString() : '...'}
            </div>
        </div>
    );
}
