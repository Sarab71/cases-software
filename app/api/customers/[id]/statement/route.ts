import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const customerId = params.id;

  try {
    const transactions = await Transaction.find({ customerId })
      .sort({ date: 1 })  // oldest first
      .lean();

    let balance = 0;

    const processedTransactions = transactions.map((txn) => {
      const isDebit = txn.type === 'debit';
      const amount = txn.amount;

      if (isDebit) {
        balance -= amount;
      } else {
        balance += amount;
      }

      return {
        date: txn.date,
        particulars: isDebit
          ? `Invoice #${txn.relatedBillId || ''}`
          : 'Payment Received',
        debit: isDebit ? Math.round(amount) : null,
        credit: !isDebit ? Math.round(amount) : null,
        balance: Math.round(balance),
      };
    });

    return NextResponse.json(processedTransactions);
  } catch (error) {
    console.error('Error fetching customer statement:', error);
    return NextResponse.json(
      { message: 'Failed to fetch statement' },
      { status: 500 }
    );
  }
}
