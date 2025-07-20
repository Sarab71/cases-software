import { NextRequest, NextResponse } from 'next/server';
import Bill from '@/models/Bill';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import dbConnect from '@/lib/mongodb';

// GET a bill by ID
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const bill = await Bill.findById(params.id).populate('customerId');

    if (!bill) {
      return NextResponse.json({ message: 'Bill not found.' }, { status: 404 });
    }

    return NextResponse.json(bill, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// UPDATE a bill by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { items, invoiceNumber, date } = await req.json();  // <-- date liya
    const bill = await Bill.findById(params.id);

    if (!bill) {
      return NextResponse.json({ message: 'Bill not found.' }, { status: 404 });
    }

    const oldGrandTotal = bill.grandTotal;

    // Process new items
    const processedItems = items.map((item: any) => {
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

    const newGrandTotal = processedItems.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

    // Update bill fields
    bill.invoiceNumber = invoiceNumber ?? bill.invoiceNumber;
    bill.items = processedItems;
    bill.grandTotal = newGrandTotal;
    if (date) bill.date = new Date(date);  // <-- bill ka date update
    await bill.save();

    // Update Transaction
    const transaction = await Transaction.findOne({ relatedBillId: bill._id });
    if (transaction) {
      transaction.amount = newGrandTotal;
      transaction.description = `Updated Bill Invoice #${bill.invoiceNumber}`;
      if (date) transaction.date = new Date(date);  // <-- transaction ka date update
      await transaction.save();
    }

    // Update Customer Balance
    const customer = await Customer.findById(bill.customerId);
    if (customer) {
      // Adjust balance: remove old amount, add new amount
      customer.balance += (oldGrandTotal - newGrandTotal);
      await customer.save();
    }

    return NextResponse.json({
      message: 'Bill, transaction, and customer balance updated.',
      bill,
      transaction,
      updatedBalance: customer?.balance
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}


// DELETE a bill by ID
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const bill = await Bill.findById(params.id);

    if (!bill) {
      return NextResponse.json({ message: 'Bill not found.' }, { status: 404 });
    }

    const transaction = await Transaction.findOne({ relatedBillId: bill._id });
    const customer = await Customer.findById(bill.customerId);

    // Remove Bill
    await bill.deleteOne();

    // Remove transaction
    if (transaction) {
      await transaction.deleteOne();
    }

    // Adjust customer balance (add back the bill amount since bill is deleted)
    if (customer) {
      customer.balance += bill.grandTotal;
      await customer.save();
    }

    return NextResponse.json({
      message: 'Bill deleted, transaction removed, customer balance updated.',
      updatedBalance: customer?.balance
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
