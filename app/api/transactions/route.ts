import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';

// POST: Create a transaction
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      customerId,
      type,
      amount,
      description,
      relatedBillId
    }: {
      customerId: string;
      type: 'credit' | 'debit';
      amount: number;
      description?: string;
      relatedBillId?: string;
    } = await req.json();

    if (!customerId || !type || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    const transaction = await Transaction.create({
      customerId,
      type,
      amount,
      description,
      relatedBillId
    });

    if (type === 'credit') {
      customer.balance += amount;
    } else if (type === 'debit') {
      customer.balance -= amount;
    }
    await customer.save();

    return NextResponse.json(transaction, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating transaction:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// GET: Get all transactions with optional filters
export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter: Record<string, unknown> = {};
    if (type) {
      filter.type = type; // 'debit' or 'credit'
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Transaction.find(filter).populate('customerId', 'name phone');

    return NextResponse.json(transactions, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching transactions:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
