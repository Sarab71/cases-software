"use client";
import { useState } from 'react';
import TotalOutstanding from '@/components/TotalOutstanding';
import PaymentsReceived from '@/components/PaymentsReceived';
import TotalSales from '@/components/TotalSales';

export default function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <>
      <h1 className="text-center text-2xl font-bold mb-2">Welcome to the Billing System</h1>
      <p className="text-center mb-8">Manage your bills and payments efficiently.</p>
      
      <div className="flex justify-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded p-1"
            max={endDate || undefined}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded p-1"
            min={startDate || undefined}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        <TotalOutstanding startDate={startDate} endDate={endDate} />
        <PaymentsReceived startDate={startDate} endDate={endDate} />
        <TotalSales startDate={startDate} endDate={endDate} />
      </div>
    </>
  );
}