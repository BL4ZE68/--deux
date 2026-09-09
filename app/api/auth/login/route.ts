import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, generateToken, getSpaceByUserId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.email);
    const space = await getSpaceByUserId(user.id);

    return NextResponse.json({
      token,
      hasSpace: !!space,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        avatar: user.avatar,
      },
      space: space || null,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
