import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Midtrans Notification:', body);

    const {
      order_id,
      status_code,
      gross_amount,
      transaction_status,
      fraud_status,
      signature_key,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { error: 'Invalid notification payload' },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isRealMidtrans = serverKey && !serverKey.includes('YOUR_SERVER_KEY_HERE') && !serverKey.includes('mock');

    if (isRealMidtrans) {
      // 1. Generate the expected signature
      // Format: SHA512(order_id + status_code + gross_amount + server_key)
      const input = order_id + status_code + gross_amount + serverKey;
      const expectedSignature = crypto
        .createHash('sha512')
        .update(input)
        .digest('hex');

      // 2. Verify signature key matches
      if (signature_key !== expectedSignature) {
        console.warn(`Signature verification failed for order ${order_id}. Signature from request: ${signature_key}, Expected: ${expectedSignature}`);
        return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
      }
      console.log(`Signature verification succeeded for order ${order_id}`);
    } else {
      console.warn('Skipping Midtrans signature verification because Server Key is missing or a mock key.');
    }

    // Connect to MongoDB
    await dbConnect();

    // 3. Process Transaction Status
    // Midtrans success statuses:
    // - capture: Credit card transaction success (if fraud_status is accept)
    // - settlement: Other methods (e.g. Bank transfer, GoPay, QRIS) success
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    const isFailed =
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire';

    let updatedStatus: 'Leads' | 'Client' | null = null;

    if (isSuccess) {
      updatedStatus = 'Client';
    } else if (isFailed) {
      updatedStatus = 'Leads';
    }

    if (updatedStatus) {
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { id: order_id },
        { status: updatedStatus },
        { returnDocument: 'after' }
      );

      if (!updatedTransaction) {
        return NextResponse.json(
          { error: `Transaction with ID ${order_id} not found in database.` },
          { status: 404 }
        );
      }

      console.log(`Successfully updated transaction ${order_id} status to: ${updatedStatus}`);
      return NextResponse.json({
        success: true,
        message: `Transaction ${order_id} updated to ${updatedStatus}`,
        transaction: updatedTransaction,
      });
    }

    console.log(`Transaction ${order_id} remains in its current state (status: ${transaction_status})`);
    return NextResponse.json({
      success: true,
      message: `No status changes required for transaction status: ${transaction_status}`,
    });
  } catch (error: any) {
    console.error('Midtrans Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing webhook' },
      { status: 500 }
    );
  }
}
