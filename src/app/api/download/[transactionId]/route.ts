import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    // 1. Hubungkan ke MongoDB
    await dbConnect();

    // 2. Cari transaksi dan validasi statusnya
    const transaction = await Transaction.findOne({ id: transactionId });
    if (!transaction || transaction.status !== 'Client') {
      return NextResponse.json(
        { error: 'Akses ditolak. Transaksi belum lunas atau tidak ditemukan.' },
        { status: 403 }
      );
    }

    // 3. Tentukan path file privat
    const filePath = path.join(process.cwd(), 'private-downloads', 'Kumpulan Template Selling Docs.zip');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File draf hukum tidak ditemukan di server.' },
        { status: 404 }
      );
    }

    // 4. Baca file sebagai Stream & Kirimkan ke Browser
    const fileStream = fs.createReadStream(filePath);
    
    // Konversi node stream ke Web ReadableStream untuk Next.js Response
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="Kumpulan Template Selling Docs.zip"',
      },
    });

  } catch (error: any) {
    console.error('Download Secure API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat mengunduh file.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
