'use client';

import { useState } from 'react';
import { CATEGORIES, FAMILY_MEMBERS, formatCurrency } from '../lib/data';
import {
  UtensilsCrossed, ShoppingCart, Zap, GraduationCap, Heart,
  Car, ShoppingBag, Gamepad2, Coffee, Home, Plane,
  Shirt, Wifi, Dumbbell, Sparkles, Baby, Dog,
  Film, Music, Banknote, Gift, TrendingUp, Briefcase,
  Wallet, Coins, MoreHorizontal, X, Check, Plus,
} from 'lucide-react';
import styles from './AddTransaction.module.css';

const ICON_MAP = {
  UtensilsCrossed, ShoppingCart, Zap, GraduationCap, Heart,
  Car, ShoppingBag, Gamepad2, Coffee, Home, Plane,
  Shirt, Wifi, Dumbbell, Sparkles, Baby, Dog,
  Film, Music, Banknote, Gift, TrendingUp, Briefcase,
  Wallet, Coins, MoreHorizontal,
};

export default function AddTransaction({ onAdd, onClose, categories: propCategories, familyMembers: propFamilyMembers }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [member, setMember] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categories = (propCategories && propCategories[type]) || CATEGORIES[type] || [];
  const familyMembers = propFamilyMembers && propFamilyMembers.length > 0 ? propFamilyMembers : FAMILY_MEMBERS;

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setAmount(raw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !member) return;

    setSubmitError('');
    setIsSaving(true);
    try {
      await onAdd({
        type,
        amount: parseInt(amount, 10),
        category,
        member,
        note,
        date: new Date(date + 'T12:00:00+07:00').toISOString(),
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
        setCategory('');
        setNote('');
      }, 1500);
    } catch (error) {
      setSubmitError(error.message || 'Không thể lưu giao dịch.');
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = amount && parseInt(amount) > 0 && category && member;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Thêm giao dịch mới</h2>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        )}
      </div>

      {showSuccess && (
        <div className={styles.successBanner}>
          <Check size={18} />
          <span>Đã lưu thành công!</span>
        </div>
      )}
      {submitError && <div className={styles.errorBanner}>{submitError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Type toggle */}
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'expense' ? styles.typeExpense : ''}`}
            onClick={() => { setType('expense'); setCategory(''); }}
          >
            Chi tiền
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'income' ? styles.typeIncome : ''}`}
            onClick={() => { setType('income'); setCategory(''); }}
          >
            Thu tiền
          </button>
        </div>

        {/* Amount */}
        <div className={styles.amountSection}>
          <label className="label" htmlFor="amount">Số tiền</label>
          <div className={styles.amountInput}>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              className={`input ${styles.amountField}`}
              placeholder="0"
              value={amount ? parseInt(amount).toLocaleString('vi-VN') : ''}
              onChange={handleAmountChange}
              autoFocus
            />
            <span className={styles.currency}>đ</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Hạng mục</label>
          <div className={styles.categoryGrid}>
            {categories.map(cat => {
              const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  className={`${styles.categoryChip} ${isSelected ? styles.categorySelected : ''}`}
                  style={isSelected ? { background: cat.color + '18', borderColor: cat.color, color: cat.color } : {}}
                  onClick={() => setCategory(cat.id)}
                >
                  <Icon size={16} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Member */}
        <div>
          <label className="label">Thành viên</label>
          <div className={styles.memberGrid}>
            {familyMembers.map(m => {
              const isSelected = member === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  className={`${styles.memberChip} ${isSelected ? styles.memberSelected : ''}`}
                  style={isSelected ? { borderColor: m.color, background: m.color + '10' } : {}}
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
            <label className="label" htmlFor="date">Ngày</label>
            <input
              id="date"
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className={styles.halfField}>
            <label className="label" htmlFor="note">Ghi chú</label>
            <input
              id="note"
              type="text"
              className="input"
              placeholder="Thêm ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-primary'} ${styles.submitBtn}`}
          disabled={!isValid || isSaving}
        >
          <Plus size={18} />
          {isSaving ? 'Đang lưu…' : type === 'expense' ? 'Lưu khoản chi' : 'Lưu khoản thu'}
        </button>
      </form>
    </div>
  );
}
