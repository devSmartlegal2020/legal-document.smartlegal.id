import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout sukses.' });
  
  // Set-Cookie expired untuk menghapus session cookie
  response.headers.set(
    'Set-Cookie',
    'admin_auth=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
  );
  
  return response;
}
