import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import jwt from 'jsonwebtoken';

// Получение списка всех пользователей
export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Неверный или истекший токен' },
        { status: 401 }
      );
    }
    const userCheck = await pool.query(
      'SELECT id, status FROM Users WHERE id = $1',
      [decoded.userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (userCheck.rows[0].status === 'blocked') {
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      'SELECT id, name, email, status, last_login_time, registration_time FROM Users ORDER BY last_login_time DESC NULLS LAST'
    );
    return NextResponse.json(
      { users: result.rows },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
