import { NextRequest, NextResponse } from 'next/server';
import Bill from '@/models/Bill';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import dbConnect from '@/lib/mongodb';

interface BillItemInput {
  modelNumber: string;
  quantity: number;
  rate: number;
  discount?: number;
}

// GET a bill by ID
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  try {
    const bill = await Bill.findById(context.params.id).populate('customerId');
    if (!bill) {
      return NextResponse.json({ message: 'Bill not found.' }, { status: 404 });
    }
    return NextResponse.json(bill, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  try {
    const { items, invoiceNumber, date }: { items: BillItemInput[]; invoiceNumber: number; date?: string } = await req.json();
    const bill = await Bill.findById(context.params.id);

    if (!bill) {
      return NextResponse.json({ message: 'Bill not found.' }, { status: 404 });
    }

    const oldGrandTotal = bill.grandTotal;
    const processedItems = items.map((item: BillItemInput) => {
      const discountPercentage = item.discount ?? 0;
      const discountAmount = item.rate * (discountPercentage / 100);
      const netAmount = item.rate - discountAmount;
      const totalAmount = netAmount * item.quantity;
      return { modelNumber: item.modelNumber, quantity: item.quantity, rate: item.rate, discount: discountPercentage, netAmount, totalAmount };
    });

    const newGrandTotal = processedItems.reduce((sum, item) => sum + item.totalAmount, 0);

    bill.invoiceNumber = invoiceNumber ?? bill.invoiceNumber;
    bill.items = processedItems;
    bill.grandTotal = newGrandTotal;
    if (date) bill.date = new Date(date);
    await bill.save();

    const transaction = await Transaction.findOne({ relatedBillId: bill._id });
    if (transaction) {
      transaction.amount = newGrandTotal;
      transaction.description = `Updated Bill Invoice #${bill.invoiceNumber}`;
      if (date) transaction.date = new Date(date);
      await transaction.save();
    }

    const customer = await Customer.findById(bill.customerId);
    if (customer) {
      customer.balance += (oldGrandTotal - newGrandTotal);
      await customer.save();
    }

    return NextResponse.json({
      message: 'Bill, transaction, and customer balance updated.',
      bill,
      transaction,
      updatedBalance: customer?.balance
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  try {
    const bill = await Bill.findById(context.params.id);
    if (!bill) {
      return NextResponse.json({ message: 'Bill not found.' }, { status: 404 });
    }

    const transaction = await Transaction.findOne({ relatedBillId: bill._id });
    const customer = await Customer.findById(bill.customerId);

    await bill.deleteOne();
    if (transaction) await transaction.deleteOne();
    if (customer) {
      customer.balance += bill.grandTotal;
      await customer.save();
    }

    return NextResponse.json({
      message: 'Bill deleted, transaction removed, customer balance updated.',
      updatedBalance: customer?.balance
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

