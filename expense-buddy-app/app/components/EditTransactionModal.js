'use client';

import { useState, useEffect } from 'react';
import {
  X, Check, AlertCircle, Save,
  UtensilsCrossed, ShoppingCart, Zap, GraduationCap, Heart,
  Car, ShoppingBag, Gamepad2, Coffee, Home, Plane,
  Shirt, Wifi, Dumbbell, Sparkles, Baby, Dog,
  Film, Music, Banknote, Gift, TrendingUp, Briefcase,
  Wallet, Coins, MoreHorizontal
} from 'lucide-react';
import styles from './EditTransactionModal.module.css';

const ICON_MAP = {
  UtensilsCrossed, ShoppingCart, Zap, GraduationCap, Heart,
  Car, ShoppingBag, Gamepad2, Coffee, Home, Plane,
  Shirt, Wifi, Dumbbell, Sparkles, Baby, Dog,
  Film, Music, Banknote, Gift, TrendingUp, Briefcase,
  Wallet, Coins, MoreHorizontal
};

export default function EditTransactionModal({
  transaction,
  categories,
  familyMembers,
  onSave,
  onClose,
}) {
  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [member, setMember] = useState(transaction?.member || '');
  const [note, setNote] = useState(transaction?.note || '');
  const [date, setDate] = useState(
    transaction?.date
      ? new Date(transaction.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
      : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Available categories for current type
  const availableCategories = categories?.[type] || [];

  // Reset or update category if type changes and current category does not belong to new type
  const handleTypeChange = (newType) => {
    setType(newType);
    const newCats = categories?.[newType] || [];
    const isStillValid = newCats.some(c => c.id === category);
    if (!isStillValid) {
      setCategory(newCats[0]?.id || '');
    }
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setAmount(raw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseInt(amount, 10) <= 0 || !category || !member) return;

    setSubmitError('');
    setIsSaving(true);
    try {
      await onSave(transaction.id, {
        ...transaction,
        type,
        amount: parseInt(amount, 10),
        category,
        member,
        note,
        date: new Date(date + 'T12:00:00+07:00').toISOString(),
      });

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setSubmitError(err.message || 'Không thể cập nhật giao dịch.');
    } finally {
      setIsSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isValid = amount && parseInt(amount, 10) > 0 && category && member;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Chỉnh sửa giao dịch</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng" disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        {showSuccess && (
          <div className={styles.successBanner}>
            <Check size={18} />
            <span>Đã cập nhật thành công!</span>
          </div>
        )}

        {submitError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Type toggle */}
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'expense' ? styles.typeExpense : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              Chi tiền
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'income' ? styles.typeIncome : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              Thu tiền
            </button>
          </div>

          {/* Amount input */}
          <div className={styles.amountSection}>
            <label className="label" htmlFor="edit-amount">Số tiền</label>
            <div className={styles.amountInput}>
              <input
                id="edit-amount"
                type="text"
                inputMode="numeric"
                className={`input ${styles.amountField}`}
                placeholder="0"
                value={amount ? parseInt(amount, 10).toLocaleString('vi-VN') : ''}
                onChange={handleAmountChange}
                autoFocus
              />
              <span className={styles.currency}>đ</span>
            </div>
          </div>

          {/* Categories Grid */}
          <div>
            <label className="label">Hạng mục</label>
            <div className={styles.categoryGrid}>
              {availableCategories.map(cat => {
                const IconComponent = ICON_MAP[cat.icon] || MoreHorizontal;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`${styles.categoryChip} ${isSelected ? styles.categorySelected : ''}`}
                    style={isSelected ? { background: cat.color + '20', borderColor: cat.color, color: cat.color } : {}}
                    onClick={() => setCategory(cat.id)}
                  >
                    <IconComponent size={16} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Member Grid */}
          <div>
            <label className="label">Thành viên</label>
            <div className={styles.memberGrid}>
              {(familyMembers || []).map(m => {
                const isSelected = member === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    className={`${styles.memberChip} ${isSelected ? styles.memberSelected : ''}`}
                    style={isSelected ? { borderColor: m.color, background: m.color + '15' } : {}}
                    onClick={() => setMember(m.id)}
                  >
                    <span className={styles.memberAvatar}>{m.avatar}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note */}
          <div className={styles.row}>
            <div className={styles.halfField}>
              <label className="label" htmlFor="edit-date">Ngày giao dịch</label>
              <input
                id="edit-date"
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className={styles.halfField}>
              <label className="label" htmlFor="edit-note">Ghi chú</label>
              <input
                id="edit-note"
                type="text"
                className="input"
                placeholder="Ghi chú thêm..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${styles.saveBtn}`}
              disabled={!isValid || isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Đang lưu thay đổi…' : 'Cập nhật giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
