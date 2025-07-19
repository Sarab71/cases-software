import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET() {
  await dbConnect();

  try {
    const lastBill = await Bill.findOne().sort({ invoiceNumber: -1 });

    return NextResponse.json({
      lastInvoice: lastBill ? lastBill.invoiceNumber : null
    });
  } catch (error) {
    console.error('Error fetching last invoice:', error);
    return NextResponse.json({ message: 'Failed to fetch last invoice number' }, { status: 500 });
  }
}
