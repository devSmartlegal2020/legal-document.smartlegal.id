import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, status } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'transactionId dan status wajib disertakan.' },
        { status: 400 }
      );
    }

    if (status !== 'Leads' && status !== 'Client') {
      return NextResponse.json(
        { error: 'Status tidak valid. Hanya menerima "Leads" atau "Client".' },
        { status: 400 }
      );
    }

    // Hubungkan ke MongoDB
    await dbConnect();

    // Cari dan perbarui status transaksi berdasarkan custom transaction id
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { id: transactionId },
      { status },
      { returnDocument: 'after' } // Menyelesaikan peringatan deprecation Mongoose
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: `Transaksi dengan ID ${transactionId} tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status transaksi ${transactionId} berhasil diperbarui menjadi ${status}.`,
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    console.error('Payment Success API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses pembaruan status pembayaran.' },
      { status: 500 }
    );
  }
}
