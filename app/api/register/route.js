import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db.js';
import { generateEmailToken, sendVerificationEmail } from '../../../lib/email.js';

// Регистрация нового пользователя
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны!' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = generateEmailToken();
    const result = await pool.query(
      'INSERT INTO Users (name, email, password, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, name, email, status',
      [name, email, hashedPassword, token]
    );

    sendVerificationEmail(email, token, name).catch(err => 
      console.error('Ошибка отправки email:', err)
    );

    return NextResponse.json(
      { 
        message: 'Регистрация успешна!', 
        user: result.rows[0] 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Этот email уже зарегистрирован' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}