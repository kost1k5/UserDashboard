import { Resend } from 'resend';
import crypto from 'crypto';

// IMPORTANT: Функция для генерации уникального токена подтверждения email
export function generateEmailToken() {
  return crypto.randomBytes(32).toString('hex');
}

// IMPORTANT: Создаем Resend клиент для отправки email
// NOTE: Если RESEND_API_KEY не настроен, письма будут выводиться в консоль
console.log('🔧 Email конфигурация (Resend):');
console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}***` : '❌ НЕ УСТАНОВЛЕН');
console.log('   FROM_EMAIL:', process.env.FROM_EMAIL || 'onboarding@resend.dev');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// IMPORTANT: Функция для отправки письма подтверждения
export async function sendVerificationEmail(email, token, userName) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  // NOTA BENE: Всегда выводим ссылку в консоль для тестирования/демонстрации
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📧 ПОДТВЕРЖДЕНИЕ EMAIL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`👤 Получатель: ${email}`);
  console.log(`🔗 Ссылка для подтверждения:\n\n   ${verificationUrl}\n`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  // NOTA BENE: Если Resend не настроен, только логируем
  if (!resend) {
    console.log('⚠️  Resend не настроен - используйте ссылку выше\n');
    return true;
  }

  // IMPORTANT: Отправка email через Resend
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Подтверждение email - User Management App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Подтверждение Email</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${userName}!</p>
              <p>Спасибо за регистрацию в User Management App!</p>
              <p>Для подтверждения вашего email-адреса, пожалуйста, нажмите на кнопку ниже:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Подтвердить Email</a>
              </div>
              <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
              <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
              <p>Если вы не регистрировались в нашем приложении, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
              <p>© 2026 User Management App. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`✅ Email отправлен через Resend на ${email}`);
    console.log(`📨 Message ID: ${data.id}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email через Resend:', error.message);
    console.error('⚠️  ВНИМАНИЕ: Email не отправлен, но ссылка выведена выше');
    console.error('💡 Проверьте RESEND_API_KEY в переменных окружения');
    // IMPORTANT: Не падаем при ошибке email - приложение должно работать
    return false;
  }
}
