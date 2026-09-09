import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, generateToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    const user = await createUser(email, password, firstName);
    const token = generateToken(user.id, user.email);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
