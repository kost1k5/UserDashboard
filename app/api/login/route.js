import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db.js';
import jwt from 'jsonwebtoken';

// Аутентификация пользователя
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны!' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    if (user.status === 'blocked') {
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован' },
        { status: 403 }
      );
    }

    // IMPORTANT: Обновляем время последнего входа
    await pool.query(
      'UPDATE Users SET last_login_time = NOW() WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return NextResponse.json(
      { 
        message: 'Вход успешен!',
        token: token,
        user: { id: user.id, name: user.name, email: user.email, status: user.status }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка входа:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

 












  