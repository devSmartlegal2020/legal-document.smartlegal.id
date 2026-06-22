import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, brandName } = body;

    // Validasi input
    if (!name || !email || !whatsapp || !brandName) {
      return NextResponse.json(
        { error: 'Semua field (Nama, Email, WhatsApp, Nama Merek) wajib diisi.' },
        { status: 400 }
      );
    }

    // Hubungkan ke MongoDB
    await dbConnect();

    // Buat ID Transaksi acak yang unik (6 digit)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `TRX-${randomDigits}`;

    // Simpan data leads ke database MongoDB
    const newTransaction = await Transaction.create({
      id: transactionId,
      name,
      email,
      whatsapp,
      brandName,
      totalPrice: 129000,
      status: 'Leads',
    });

    // Dapatkan host URL secara dinamis untuk webhook callback
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const defaultWebhookUrl = `${protocol}://${host}/api/webhook`;
    const notificationUrl = process.env.MIDTRANS_NOTIFICATION_URL || defaultWebhookUrl;
    console.log(`Configured Midtrans notification URL: ${notificationUrl}`);

    // Tentukan URL Snap API berdasarkan environment (production vs sandbox)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const midtransUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    let snapToken = '';

    // Cek apakah server key valid dan bukan mock/placeholder
    const isRealMidtrans = serverKey && !serverKey.includes('YOUR_SERVER_KEY_HERE') && !serverKey.includes('mock');

    if (isRealMidtrans) {
      try {
        const authHeader = Buffer.from(serverKey + ':').toString('base64');
        
        // Buat payload transaksi untuk Midtrans
        const payload = {
          transaction_details: {
            order_id: transactionId,
            gross_amount: 129000,
          },
          customer_details: {
            first_name: name,
            email: email,
            phone: whatsapp,
          },
          credit_card: {
            secure: true
          }
        };

        const midtransResponse = await fetch(midtransUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authHeader}`,
            'X-Override-Notification': notificationUrl,
          },
          body: JSON.stringify(payload),
        });

        const midtransData = await midtransResponse.json();

        if (!midtransResponse.ok) {
          throw new Error(midtransData.error_messages?.join(', ') || 'Gagal terhubung ke Midtrans API.');
        }

        snapToken = midtransData.token;
      } catch (err: any) {
        console.error('Midtrans API connection failed:', err);
        return NextResponse.json(
          { error: `Gagal membuat transaksi di Midtrans: ${err.message}` },
          { status: 500 }
        );
      }
    } else {
      // Fallback ke Mock Snap Token untuk testing lokal/tanpa internet/tanpa API key
      snapToken = `snap-token-mock-${transactionId}-${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi Leads berhasil dibuat.',
      token: snapToken,
      transaction: newTransaction,
    });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses checkout.' },
      { status: 500 }
    );
  }
}
