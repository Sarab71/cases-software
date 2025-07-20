import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  await dbConnect();

  try {
    const payment = await Transaction.findById(params.id);

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    if (payment.type !== 'credit') {
      return NextResponse.json({ message: 'This transaction is not a payment (credit)' }, { status: 400 });
    }

    return NextResponse.json(payment);
  } catch (error: unknown) {
    console.error('Error fetching payment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update Payment
export async function PATCH(req: NextRequest, { params }: Params) {
  await dbConnect();

  try {
    const { amount, description, date }: { amount: number; description?: string; date?: string } = await req.json();

    const payment = await Transaction.findById(params.id);
    if (!payment || payment.type !== 'credit') {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    const customer = await Customer.findById(payment.customerId);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    customer.balance -= payment.amount; // remove old amount
    customer.balance += amount;         // add new amount
    await customer.save();

    payment.amount = amount;
    if (description) payment.description = description;
    if (date) payment.date = new Date(date);
    await payment.save();

    return NextResponse.json({ message: 'Payment updated successfully', payment });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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

    customer.balance -= payment.amount;
    await customer.save();

    await payment.deleteOne();

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
