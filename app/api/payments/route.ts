import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      customerId,
      amount,
      description,
      date,
    }: {
      customerId: string;
      amount: number;
      description?: string;
      date?: string;
    } = await req.json();

    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Customer ID and valid amount are required.' },
        { status: 400 }
      );
    }

    // Verify Customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found.' },
        { status: 404 }
      );
    }

    // Create a Credit Transaction
    const creditTransaction = new Transaction({
      customerId: new mongoose.Types.ObjectId(customerId),
      type: 'credit',
      amount,
      description: description || 'Payment Received',
      date: date ? new Date(date) : new Date(),
    });

    await creditTransaction.save();

    // Update Customer Balance
    customer.balance += amount;
    await customer.save();

    return NextResponse.json(
      {
        message: 'Payment recorded successfully.',
        transaction: creditTransaction,
        updatedBalance: customer.balance,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error adding payment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
