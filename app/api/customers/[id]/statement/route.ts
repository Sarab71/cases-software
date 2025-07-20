import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Bill from '@/models/Bill';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const customerId = params.id;

  try {
    const transactions = await Transaction.find({ customerId })
      .sort({ date: 1 }) // oldest first
      .lean();

    let balance = 0;

    // Collect all related billIds
    const billIds = transactions
      .filter(txn => txn.relatedBillId)
      .map(txn => new mongoose.Types.ObjectId(txn.relatedBillId));

    const bills = await Bill.find({ _id: { $in: billIds } }).lean();

    // Map for quick lookup
    const billMap = new Map<string, number>();
    bills.forEach(bill => {
      billMap.set(String(bill._id), bill.invoiceNumber);
    });

const processedTransactions = transactions.map((txn) => {
  const isDebit = txn.type === 'debit';
  const amount = txn.amount;

  if (isDebit) {
    balance -= amount;
  } else {
    balance += amount;
  }

  const invoiceNumber = txn.invoiceNumber || (txn.relatedBillId ? billMap.get(String(txn.relatedBillId)) : null);

  return {
    date: txn.date,
    particulars: isDebit
      ? `Invoice #${invoiceNumber ?? 'N/A'}`
      : 'Payment Received',
    debit: isDebit ? Math.round(amount) : null,
    credit: !isDebit ? Math.round(amount) : null,
    balance: Math.round(balance),
    invoiceNumber: invoiceNumber ?? null,
    relatedBillId: txn.relatedBillId ? String(txn.relatedBillId) : null,   // ✅ Add this line
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
