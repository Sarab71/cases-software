import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

interface Params {
  params: {
    id: string;
  };
}

// GET: Get Customer by ID
export async function GET(request: NextRequest, { params }: Params) {
  await dbConnect();
  const customer = await Customer.findById(params.id);
  if (!customer) {
    return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json(customer);
}

// PUT: Update Customer
export async function PUT(request: NextRequest, { params }: Params) {
  await dbConnect();
  const data = await request.json();

  try {
    const customer = await Customer.findByIdAndUpdate(params.id, data, { new: true });
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

// DELETE: Delete Customer
export async function DELETE(request: NextRequest, { params }: Params) {
  await dbConnect();
  try {
    const customer = await Customer.findByIdAndDelete(params.id);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
