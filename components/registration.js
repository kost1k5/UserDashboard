'use client';

import { useState } from 'react';
import { useToast } from './ToastProvider';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // ШАГ 3: Проверяем успешность
      if (response.ok) {
        toast.success(data.message + ' Теперь войдите в систему!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error(data.error);
      }

    } catch (error) {
      console.error('Ошибка:', error);
      toast.error('Не удалось связаться с сервером');
    }
  };

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row h-100 m-0">
        
        
        <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark">
          <div className="w-100 px-4" style={{ maxWidth: '450px' }}>
            
       
            <div className="mb-5">
              <h1 className="fw-bold text-primary" style={{ letterSpacing: '2px' }}>
                THE APP
              </h1>
            </div>

            <div className="mb-4">
              <p className="text-secondary mb-1 small">Start your journey</p>
              <h2 className="fw-bold mb-0">Sign In to The App</h2>
            </div>

            <form onSubmit={handleSubmit}>
              
            
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Name</label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control form-control-lg pe-5 fs-6"
                    placeholder="User Name"
                    required
                  />
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted">
                    <i className="bi bi-person"></i>
                  </span>
                </div>
              </div>

            
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">E-mail</label>
                <div className="position-relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-lg pe-5 fs-6"
                    placeholder="test@example.com"
                    required
                  />
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                </div>
              </div>

         
              <div className="mb-2">
                <label className="form-label text-muted small fw-bold text-uppercase">Password</label>
                <div className="position-relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control form-control-lg pe-5 fs-6"
                    placeholder="••••••••"
                    required
                  />
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{cursor: 'pointer'}}>
                    <i className="bi bi-eye"></i>
                  </span>
                </div>
              </div>

              <div className="mb-4 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label text-secondary small" htmlFor="rememberMe">Remember me</label>
              </div>

         
              <div className="d-grid mb-4">
                <button type="submit" className="btn btn-primary btn-lg fw-bold fs-6">
                  Sign Up
                </button>
              </div>

              
              <div className="d-flex justify-content-between align-items-center text-secondary small">
                <span>Already have an account? <a href="/login" className="text-decoration-none text-primary">Sign in</a></span>
                <a href="#" className="text-decoration-none text-primary">Forgot password?</a>
              </div>

            </form>
          </div>
        </div>

     
        <div className="col-lg-6 d-none d-lg-block p-0 position-relative bg-primary overflow-hidden">
       
           <div className="w-100 h-100" style={{
             background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
             position: 'relative'
           }}>
            
             <div className="position-absolute bg-white opacity-10" style={{ width: '300px', height: '300px', top: '-50px', right: '-50px', transform: 'rotate(45deg)' }}></div>
             <div className="position-absolute bg-white opacity-10" style={{ width: '400px', height: '400px', bottom: '-100px', left: '-100px', transform: 'rotate(30deg)' }}></div>
             <div className="position-absolute bg-white opacity-25 rounded-circle blur" style={{ width: '200px', height: '200px', top: '40%', left: '40%', filter: 'blur(80px)' }}></div>
           </div>
        </div>

      </div>
    </div>
  );
}
