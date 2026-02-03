import nodemailer from 'nodemailer';
import crypto from 'crypto';

// IMPORTANT: Функция для генерации уникального токена подтверждения email
export function generateEmailToken() {
  return crypto.randomBytes(32).toString('hex');
}

// IMPORTANT: Создаем транспортер для отправки email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// IMPORTANT: Функция для отправки письма подтверждения
export async function sendVerificationEmail(email, token, userName) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
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
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email отправлен на ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    return false;
  }
}
