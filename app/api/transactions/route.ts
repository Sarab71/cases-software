import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';

// Create a transaction
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const data = await req.json();
    const { customerId, type, amount, description, relatedBillId } = data;

    if (!customerId || !type || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    // Create transaction
    const transaction = await Transaction.create({
      customerId,
      type,
      amount,
      description,
      relatedBillId
    });

    // Update customer balance
    if (type === 'credit') {
      customer.balance += amount;
    } else if (type === 'debit') {
      customer.balance -= amount;
    }
    await customer.save();

    return NextResponse.json(transaction, { status: 201 });

  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// Get all transactions (with optional type filter)

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filter: any = {};
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
    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
