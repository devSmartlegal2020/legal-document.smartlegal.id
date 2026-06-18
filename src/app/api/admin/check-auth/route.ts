import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const isAuthenticated = cookieHeader.includes('admin_auth=authenticated');
  
  return NextResponse.json({ authenticated: isAuthenticated });
}

export const dynamic = 'force-dynamic';
