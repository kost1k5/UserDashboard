import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 400 }
      );
    }
    
    const result = await pool.query(
      'UPDATE Users SET status = $1, verification_token = $2 WHERE verification_token = $3',
      ['active', null, token]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Неверный или истекший токен' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Email успешно подтвержден!' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Ошибка подтверждения email:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
