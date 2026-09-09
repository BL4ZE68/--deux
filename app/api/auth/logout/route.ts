import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Simply clear the token on the client side
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
