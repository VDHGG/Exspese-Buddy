'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import styles from './AuthGate.module.css';

export default function AuthGate({ configured, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const error = await onSignIn(email, password);
    if (error) {
      if (error.includes('Invalid login credentials')) {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else {
        setErrorMsg(error);
      }
    }
    setLoading(false);
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}><ShieldCheck size={28} /></div>
        <h1>Expense Buddy</h1>
        <p>Đăng nhập để lưu và đồng bộ chi tiêu gia đình.</p>
        {!configured ? (
          <div className={styles.notice}>Chưa có kết nối Supabase. Làm theo file <code>SUPABASE_SETUP.md</code> để bật bản cloud.</div>
        ) : (
          <form onSubmit={submit} className={styles.form}>
            <label htmlFor="email">Email tài khoản</label>
            <div className={styles.inputWrap}>
              <Mail size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
              />
            </div>

            <label htmlFor="password">Mật khẩu</label>
            <div className={styles.inputWrap}>
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          </form>
        )}
      </section>
    </main>
  );
}
