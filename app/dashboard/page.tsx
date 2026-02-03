'use client';

import { useEffect, useState } from 'react';
import UserTable from '@/components/UserTable';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.error || 'Ошибка загрузки пользователей');
      }

      setUsers(data.users);
      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>❌ Ошибка</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom mb-4">
            <div className="container-fluid">
              <span className="navbar-brand fw-bold">User Management Panel</span>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  localStorage.removeItem('token');
                  document.cookie = 'token=; path=/; max-age=0';
                  window.location.href = '/login';
                }}
              >
                Выйти
              </button>
            </div>
          </nav>

          <UserTable users={users} onRefresh={fetchUsers} />
        </div>
      </div>
    </div>
  );
}
