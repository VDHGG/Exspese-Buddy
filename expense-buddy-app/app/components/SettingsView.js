'use client';

import { useState } from 'react';
import { RefreshCw, Download, Upload, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency, STORAGE_KEY, saveData } from '../lib/data';
import styles from './SettingsView.module.css';

export default function SettingsView({ data, onUpdateBudget, onReset }) {
  const [budgetInput, setBudgetInput] = useState(
    data?.monthlyBudget ? data.monthlyBudget.toString() : ''
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBudgetSave = () => {
    const val = parseInt(budgetInput.replace(/[^\d]/g, ''), 10);
    if (val > 0) {
      onUpdateBudget(val);
    }
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported.transactions) {
          saveData(imported);
          window.location.reload();
        }
      } catch {
        alert('File không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cài đặt</h2>

      {/* Budget */}
      <div className={`card ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <Target size={20} color="#F59E0B" />
          <h3>Ngân sách hàng tháng</h3>
        </div>
        <p className={styles.desc}>
          Đặt mức ngân sách để theo dõi chi tiêu gia đình. Hiện tại:{' '}
          <strong>{formatCurrency(data?.monthlyBudget || 0)}</strong>
        </p>
        <div className={styles.budgetRow}>
          <input
            type="text"
            className="input"
            placeholder="Nhập ngân sách..."
            value={budgetInput ? parseInt(budgetInput).toLocaleString('vi-VN') : ''}
            onChange={(e) => setBudgetInput(e.target.value.replace(/[^\d]/g, ''))}
          />
          <button className="btn btn-primary" onClick={handleBudgetSave}>
            Lưu
          </button>
        </div>
      </div>

      {/* Export / Import */}
      <div className={`card ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <Download size={20} color="#3B82F6" />
          <h3>Sao lưu & Khôi phục</h3>
        </div>
        <p className={styles.desc}>
          Xuất dữ liệu ra file JSON để sao lưu, hoặc nhập dữ liệu từ file đã lưu.
        </p>
        <div className={styles.actionRow}>
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={16} />
            Xuất dữ liệu (JSON)
          </button>
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            Nhập dữ liệu
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Reset */}
      <div className={`card ${styles.section} ${styles.dangerSection}`}>
        <div className={styles.sectionHeader}>
          <AlertTriangle size={20} color="#E11D48" />
          <h3>Khôi phục dữ liệu mẫu</h3>
        </div>
        <p className={styles.desc}>
          Xóa toàn bộ dữ liệu hiện tại và khôi phục về dữ liệu mẫu ban đầu. Hành động này không thể hoàn tác.
        </p>
        {!showConfirm ? (
          <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>
            <RefreshCw size={14} />
            Reset về dữ liệu mẫu
          </button>
        ) : (
          <div className={styles.confirmRow}>
            <p className={styles.confirmText}>Bạn chắc chắn muốn xóa tất cả dữ liệu?</p>
            <div className={styles.confirmBtns}>
              <button className="btn btn-danger btn-sm" onClick={() => { onReset(); setShowConfirm(false); }}>
                Xóa và reset
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
