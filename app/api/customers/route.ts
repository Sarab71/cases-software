import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

// GET: Fetch All Customers
export async function GET() {
  await dbConnect();
  const customers = await Customer.find().sort({ createdAt: -1 });
  return NextResponse.json(customers);
}

// POST: Create New Customer
export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();

  try {
    const customer = new Customer(data);
    await customer.save();
    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Unknown error occurred' }, { status: 400 });
  }
}
