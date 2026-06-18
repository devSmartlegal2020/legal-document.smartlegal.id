import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'password123';

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({ success: true, message: 'Login sukses.' });
      
      // Set secure HttpOnly cookie session (berlaku 1 hari)
      response.headers.set(
        'Set-Cookie',
        `admin_auth=authenticated; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; ${
          process.env.NODE_ENV === 'production' ? 'Secure;' : ''
        }`
      );
      
      return response;
    }

    return NextResponse.json(
      { error: 'Username atau password salah.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Admin Login API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat mencoba login.' },
      { status: 500 }
    );
  }
}
