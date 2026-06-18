import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    // Validasi sesi admin melalui cookie
    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader.includes('admin_auth=authenticated')) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    // Hubungkan ke MongoDB
    await dbConnect();

    // Ambil semua transaksi terdaftar, urutkan descending
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Fetch Transactions API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data transaksi.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
