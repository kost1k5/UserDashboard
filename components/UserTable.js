'use client';

import { useState } from 'react';
import { useToast } from './ToastProvider';

export default function UserTable({ users, onRefresh }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const toast = useToast();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAction = async (action, confirmMessage = null) => {
    if (selectedUsers.length === 0 && action !== 'delete_unverified') {
      toast.warning('Выберите хотя бы одного пользователя');
      return;
    }

    if (confirmMessage) {
      setShowConfirm({ action, message: confirmMessage });
      return;
    }

    await executeAction(action);
  };

  const executeAction = async (action) => {
    setIsLoading(true);
    setShowConfirm(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          userIds: action === 'delete_unverified' ? [] : selectedUsers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Операция не выполнена');
        return;
      }

      if (data.selfDeleted) {
        toast.success('Вы удалили свой аккаунт');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 1500);
        return;
      }

      toast.success(data.message);
      setSelectedUsers([]);
      onRefresh();
    } catch (error) {
      console.error('Ошибка:', error);
      toast.error('Не удалось выполнить операцию');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = () => handleAction('block');
  const handleUnblock = () => handleAction('unblock');
  const handleDelete = () => handleAction('delete', `Вы уверены, что хотите удалить ${selectedUsers.length} пользователей?`);
  const handleDeleteUnverified = () => handleAction('delete_unverified', 'Вы уверены, что хотите удалить ВСЕ неподтвержденные аккаунты?');

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'less than a minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} weeks ago`;
    
    return date.toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-success',
      'blocked': 'bg-danger',
      'unverified': 'bg-warning text-dark'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  const filteredUsers = users.filter(user => 
    !filterText || 
    user.name.toLowerCase().includes(filterText.toLowerCase()) ||
    user.email.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container-fluid px-4">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white border rounded shadow-sm">
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            onClick={handleBlock}
            disabled={selectedUsers.length === 0 || isLoading}
            title="Block selected users"
          >
            <i className="bi bi-lock-fill"></i>
            Block
          </button>

          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={handleUnblock}
            disabled={selectedUsers.length === 0 || isLoading}
            title="Unblock selected users"
          >
            <i className="bi bi-unlock-fill"></i>
          </button>

          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
            disabled={selectedUsers.length === 0 || isLoading}
            title="Delete selected users"
          >
            <i className="bi bi-trash-fill"></i>
          </button>

          <button 
            className="btn btn-danger btn-sm"
            onClick={handleDeleteUnverified}
            disabled={isLoading}
            title="Delete all unverified users"
          >
            <i className="bi bi-trash-fill"></i>
          </button>
        </div>

        <div>
          <input 
            type="text" 
            className="form-control form-control-sm" 
            placeholder="Filter"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive bg-white border rounded shadow-sm">
        <table className="table table-hover table-sm mb-0">
          <thead className="table-light border-bottom">
            <tr>
              <th style={{ width: '40px' }} className="ps-3">
                <input 
                  type="checkbox" 
                  className="form-check-input"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="fw-semibold">Name</th>
              <th className="fw-semibold">Email</th>
              <th className="fw-semibold">Status</th>
              <th className="fw-semibold">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="align-middle">
                <td className="ps-3">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                
                <td>
                  <div className="fw-bold text-dark">{user.name}</div>
                  <div className="text-muted small">N/A</div>
                </td>
                
                <td className="text-muted">{user.email}</td>
                
                <td>
                  <span className={getStatusBadge(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                
                <td className="text-muted small">
                  {formatLastSeen(user.last_login_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox display-1 d-block mb-3"></i>
          <p className="mb-0">{filterText ? 'Нет результатов' : 'Нет пользователей'}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Подтверждение</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirm(null)}
                />
              </div>
              <div className="modal-body">
                <p>{showConfirm.message}</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirm(null)}
                >
                  Отмена
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => executeAction(showConfirm.action)}
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ background: 'rgba(0,0,0,0.1)', zIndex: 9999 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}
    </div>
  );
}
