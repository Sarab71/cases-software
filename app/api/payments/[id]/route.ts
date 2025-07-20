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
    const payment = await Transaction.findById(params.id).lean() as any;

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    if (payment.type !== 'credit') {
      return NextResponse.json({ message: 'This transaction is not a payment (credit)' }, { status: 400 });
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update Payment
export async function PATCH(req: NextRequest, { params }: Params) {
  await dbConnect();

  try {
    const { amount, description, date } = await req.json();  // <-- date added here

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
    if (date) payment.date = new Date(date); // <-- date updated if provided
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
