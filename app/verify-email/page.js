'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Токен не найден в URL');
        return;
      }

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ошибка соединения с сервером');
        console.error('Ошибка подтверждения email:', error);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="text-muted">Подтверждаем ваш email...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
            </div>
            <h2 className="card-title mb-3">Email подтвержден!</h2>
            <p className="card-text text-muted mb-4">{message}</p>
            <Link href="/login" className="btn btn-primary btn-lg">
              Войти в систему
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body text-center p-5">
          <div className="mb-4">
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '5rem' }}></i>
          </div>
          <h2 className="card-title mb-3">Ошибка подтверждения</h2>
          <p className="card-text text-muted mb-4">{message}</p>
          <Link href="/registration" className="btn btn-outline-primary">
            Зарегистрироваться заново
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="text-muted">Подтверждаем ваш email...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
