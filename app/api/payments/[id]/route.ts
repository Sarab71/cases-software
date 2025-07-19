import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';

interface Params {
  params: { id: string };
}

// PATCH: Update Payment
export async function PATCH(req: NextRequest, { params }: Params) {
  await dbConnect();

  try {
    const { amount, description } = await req.json();

    const payment = await Transaction.findById(params.id);
    if (!payment || payment.type !== 'credit') {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    // Update customer balance: Remove old amount, add new amount
    const customer = await Customer.findById(payment.customerId);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    customer.balance -= payment.amount; // remove old amount
    customer.balance += amount;         // add new amount
    await customer.save();

    // Update transaction
    payment.amount = amount;
    if (description) payment.description = description;
    await payment.save();

    return NextResponse.json({ message: 'Payment updated successfully', payment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE: Delete Payment
export async function DELETE(req: NextRequest, { params }: Params) {
  await dbConnect();

  try {
    const payment = await Transaction.findById(params.id);
    if (!payment || payment.type !== 'credit') {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    const customer = await Customer.findById(payment.customerId);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    // Reverse balance adjustment
    customer.balance -= payment.amount;
    await customer.save();

    await payment.deleteOne();

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
