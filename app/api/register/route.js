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
    
    let result;
    try {
      result = await pool.query(
        'INSERT INTO Users (name, email, password, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, name, email, status',
        [name, email, hashedPassword, token]
      );
    } catch (dbError) {
      console.error('Ошибка БД:', dbError);
      
      // CRITICAL: Обработка ошибки уникального индекса на уровне БД
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'Этот email уже зарегистрирован' },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // IMPORTANT: Отправка email асинхронно, не блокирует ответ
    // NOTE: Логируем попытку отправки для отладки
    console.log(`📧 Попытка отправки email на ${email}`);
    sendVerificationEmail(email, token, name)
      .then(() => console.log(`✅ Email успешно отправлен на ${email}`))
      .catch(err => {
        console.error(`❌ Ошибка отправки email на ${email}:`, err.message);
        console.error('Детали:', err);
      });

    return NextResponse.json(
      { 
        message: 'Регистрация успешна! Проверьте email для подтверждения.', 
        user: result.rows[0],
        // NOTA BENE: В режиме разработки показываем токен в ответе
        ...(process.env.NODE_ENV === 'development' ? { verificationToken: token } : {})
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