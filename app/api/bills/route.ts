import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { invoiceNumber, customerId, items, date }: { 
      invoiceNumber: number; 
      customerId: string; 
      items: BillItemInput[]; 
      date: string; 
    } = await req.json();

    if (!invoiceNumber || !customerId || !Array.isArray(items) || items.length === 0 || !date) {
      return NextResponse.json({ message: 'Missing required fields or items.' }, { status: 400 });
    }

    // Process items
    const processedItems = items.map((item: BillItemInput) => {
      const discountPercentage = item.discount ?? 0;
      const discountAmount = item.rate * (discountPercentage / 100);
      const netAmount = item.rate - discountAmount;
      const totalAmount = netAmount * item.quantity;

      return {
        modelNumber: item.modelNumber,
        quantity: item.quantity,
        rate: item.rate,
        discount: discountPercentage > 0 ? discountPercentage : undefined,
        netAmount,
        totalAmount
      };
    });

    // Grand total with rounding
    const grandTotal = Math.round(
      processedItems.reduce((sum: number, item: { totalAmount: number }) => sum + item.totalAmount, 0)
    );

    // Create the Bill
    const newBill = new Bill({
      invoiceNumber,
      customerId: new mongoose.Types.ObjectId(customerId),
      items: processedItems,
      grandTotal,
      date: new Date(date)
    });

    await newBill.save();

    // Create Transaction (debit)
    const newTransaction = new Transaction({
      customerId: new mongoose.Types.ObjectId(customerId),
      type: 'debit',
      amount: grandTotal,
      description: `Bill Invoice #${invoiceNumber}`,
      relatedBillId: newBill._id,
      invoiceNumber,
      date: new Date(date)
    });

    await newTransaction.save();

    // Update Customer Balance
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.balance -= grandTotal;
      await customer.save();
    }

    return NextResponse.json({
      message: 'Bill and transaction created, customer balance updated.',
      bill: newBill,
      transaction: newTransaction,
      updatedBalance: customer?.balance
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating bill and transaction:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
