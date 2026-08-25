'use client';

import { useState } from 'react';
import { Mail, Cloud } from 'lucide-react';
import styles from './AuthGate.module.css';

export default function AuthGate({ configured, onSignIn }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus('');
    const message = await onSignIn(email);
    setStatus(message || 'Đã gửi link đăng nhập. Hãy mở email để tiếp tục.');
    setSending(false);
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}><Cloud size={28} /></div>
        <h1>Expense Buddy</h1>
        <p>Đăng nhập để lưu và đồng bộ chi tiêu gia đình.</p>
        {!configured ? (
          <div className={styles.notice}>Chưa có kết nối Supabase. Làm theo file <code>SUPABASE_SETUP.md</code> để bật bản cloud.</div>
        ) : (
          <form onSubmit={submit} className={styles.form}>
            <label htmlFor="email">Email của bạn</label>
            <div className={styles.inputWrap}><Mail size={18} /><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" required /></div>
            <button className="btn btn-primary" disabled={sending}>{sending ? 'Đang gửi…' : 'Gửi link đăng nhập'}</button>
            {status && <p className={styles.status}>{status}</p>}
          </form>
        )}
      </section>
    </main>
  );
}
