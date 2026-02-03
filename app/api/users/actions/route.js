import { NextResponse } from 'next/server';
import pool from '../../../../lib/db.js';
import jwt from 'jsonwebtoken';

// Обработка действий над пользователями: блокировка, разблокировка, удаление
export async function POST(request) {
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

    const { action, userIds } = await request.json();

    // IMPORTANT: delete_unverified не требует userIds
    if (!action) {
      return NextResponse.json(
        { error: 'Укажите действие' },
        { status: 400 }
      );
    }

    if (action !== 'delete_unverified' && (!userIds || !Array.isArray(userIds) || userIds.length === 0)) {
      return NextResponse.json(
        { error: 'Укажите список пользователей' },
        { status: 400 }
      );
    }
    let result;
    let message;

    switch (action) {
      case 'block':
        result = await pool.query(
          'UPDATE Users SET status = $1 WHERE id = ANY($2)',
          ['blocked', userIds]
        );
        message = `Заблокировано пользователей: ${result.rowCount}`;
        break;

      case 'unblock':
        result = await pool.query(
          'UPDATE Users SET status = $1 WHERE id = ANY($2)',
          ['active', userIds]
        );
        message = `Разблокировано пользователей: ${result.rowCount}`;
        break;

      case 'delete':
        result = await pool.query(
          'DELETE FROM Users WHERE id = ANY($1)',
          [userIds]
        );
        message = `Удалено пользователей: ${result.rowCount}`;
        
        if (userIds.includes(decoded.userId)) {
          return NextResponse.json(
            { 
              message: message,
              selfDeleted: true
            },
            { status: 200 }
          );
        }
        break;

      case 'delete_unverified':
        result = await pool.query(
          'DELETE FROM Users WHERE status = $1',
          ['unverified']
        );
        message = `Удалено неподтвержденных пользователей: ${result.rowCount}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { 
        success: true,
        message: message,
        affectedRows: result.rowCount
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка выполнения действия:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
