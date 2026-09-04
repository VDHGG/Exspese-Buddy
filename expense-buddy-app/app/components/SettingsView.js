'use client';

import { useState } from 'react';
import {
  RefreshCw, Download, Upload, Target, AlertTriangle,
  Users, Layers, Plus, Trash2, Pencil, Check, X,
  Bot, Send,
  UtensilsCrossed, ShoppingCart, Zap, GraduationCap, Heart,
  Car, ShoppingBag, Gamepad2, Coffee, Home, Plane,
  Shirt, Wifi, Dumbbell, Sparkles, Baby, Dog,
  Film, Music, Banknote, Gift, TrendingUp, Briefcase,
  Wallet, Coins, MoreHorizontal
} from 'lucide-react';
import {
  formatCurrency,
  AVAILABLE_ICONS,
  COLOR_PALETTE,
  AVATAR_OPTIONS,
  DEFAULT_CATEGORIES,
  DEFAULT_FAMILY_MEMBERS
} from '../lib/data';
import styles from './SettingsView.module.css';

const ICON_MAP = {
  UtensilsCrossed, ShoppingCart, Zap, GraduationCap, Heart,
  Car, ShoppingBag, Gamepad2, Coffee, Home, Plane,
  Shirt, Wifi, Dumbbell, Sparkles, Baby, Dog,
  Film, Music, Banknote, Gift, TrendingUp, Briefcase,
  Wallet, Coins, MoreHorizontal
};

export default function SettingsView({
  data,
  onUpdateBudget,
  onReset,
  onImport,
  onUpdateCategories,
  onUpdateFamilyMembers,
}) {
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' | 'members' | 'categories'

  // Budget state
  const [budgetInput, setBudgetInput] = useState(
    data?.monthlyBudget ? data.monthlyBudget.toString() : ''
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  // Family members state
  const familyMembers = data?.familyMembers || DEFAULT_FAMILY_MEMBERS;
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👨');
  const [newMemberColor, setNewMemberColor] = useState(COLOR_PALETTE[0]);
  const [memberActionError, setMemberActionError] = useState('');

  // Categories state
  const categories = data?.categories || DEFAULT_CATEGORIES;
  const [catType, setCatType] = useState('expense'); // 'expense' | 'income'
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
  const [catActionError, setCatActionError] = useState('');

  // Bot & AI Integrations state
  const [smokeTestStatus, setSmokeTestStatus] = useState('');
  const [isSendingSmoke, setIsSendingSmoke] = useState(false);

  const transactions = data?.transactions || [];

  const handleSmokeTest = async () => {
    setIsSendingSmoke(true);
    setSmokeTestStatus('');
    try {
      const res = await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSmokeTest: true }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.ok) {
        throw new Error(resData.error || 'Lỗi gửi tin nhắn Telegram.');
      }
      setSmokeTestStatus('Đã gửi tin nhắn thử nghiệm thành công vào nhóm Buddy!');
    } catch (err) {
      setSmokeTestStatus('Lỗi: ' + err.message);
    } finally {
      setIsSendingSmoke(false);
    }
  };

  // ================= Budget Handlers =================
  const handleBudgetSave = async () => {
    const val = parseInt(budgetInput.replace(/[^\d]/g, ''), 10);
    if (val > 0) {
      setIsSaving(true);
      setStatus('');
      try {
        await onUpdateBudget(val);
        setStatus('Đã cập nhật ngân sách thành công.');
      } catch (error) {
        setStatus(error.message || 'Không thể cập nhật ngân sách.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExport = () => {
    const exportPayload = {
      monthlyBudget: data?.monthlyBudget || 35000000,
      categories: data?.categories || DEFAULT_CATEGORIES,
      familyMembers: data?.familyMembers || DEFAULT_FAMILY_MEMBERS,
      transactions: data?.transactions || [],
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
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
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        setIsSaving(true);
        setStatus('');
        const count = await onImport(imported);
        setStatus(`Đã khôi phục ${count} giao dịch và cập nhật cấu hình.`);
      } catch (error) {
        setStatus(error.message || 'File không hợp lệ.');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsText(file);
  };

  // ================= Member Handlers =================
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setMemberActionError('');
    setIsSaving(true);
    try {
      if (editingMemberId) {
        // Edit existing
        const updated = familyMembers.map(m =>
          m.id === editingMemberId
            ? { ...m, name: newMemberName.trim(), avatar: newMemberAvatar, color: newMemberColor }
            : m
        );
        await onUpdateFamilyMembers(updated);
        setEditingMemberId(null);
      } else {
        // Add new
        const id = 'mem_' + Date.now().toString(36);
        const newMember = {
          id,
          name: newMemberName.trim(),
          avatar: newMemberAvatar,
          color: newMemberColor,
          isSystem: false,
        };
        await onUpdateFamilyMembers([...familyMembers, newMember]);
      }
      setNewMemberName('');
      setShowAddMember(false);
    } catch (err) {
      setMemberActionError(err.message || 'Không thể lưu thành viên.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditMember = (m) => {
    setEditingMemberId(m.id);
    setNewMemberName(m.name);
    setNewMemberAvatar(m.avatar);
    setNewMemberColor(m.color);
    setShowAddMember(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (familyMembers.length <= 1) {
      setMemberActionError('Gia đình cần có ít nhất một thành viên.');
      return;
    }

    const linkedCount = transactions.filter(t => t.member === memberId).length;
    if (linkedCount > 0) {
      const confirmed = window.confirm(
        `Thành viên này đang có ${linkedCount} giao dịch liên kết. Các giao dịch cũ vẫn sẽ giữ tên hiển thị cũ. Bạn có chắc muốn xóa?`
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    setMemberActionError('');
    try {
      const updated = familyMembers.filter(m => m.id !== memberId);
      await onUpdateFamilyMembers(updated);
    } catch (err) {
      setMemberActionError(err.message || 'Không thể xóa thành viên.');
    } finally {
      setIsSaving(false);
    }
  };

  // ================= Category Handlers =================
  const currentCategories = categories?.[catType] || [];

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCatActionError('');
    setIsSaving(true);
    try {
      const currentList = categories?.[catType] || [];
      let updatedList;

      if (editingCategoryId) {
        updatedList = currentList.map(c =>
          c.id === editingCategoryId
            ? { ...c, name: newCatName.trim(), icon: newCatIcon, color: newCatColor }
            : c
        );
      } else {
        const id = 'cat_' + Date.now().toString(36);
        const newCat = {
          id,
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
          isSystem: false,
        };
        updatedList = [...currentList, newCat];
      }

      const newCategories = {
        ...categories,
        [catType]: updatedList,
      };

      await onUpdateCategories(newCategories);
      setNewCatName('');
      setEditingCategoryId(null);
      setShowAddCategory(false);
    } catch (err) {
      setCatActionError(err.message || 'Không thể lưu danh mục.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditCategory = (c) => {
    setEditingCategoryId(c.id);
    setNewCatName(c.name);
    setNewCatIcon(c.icon);
    setNewCatColor(c.color);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (catId) => {
    const list = categories?.[catType] || [];
    if (list.length <= 1) {
      setCatActionError('Cần giữ lại ít nhất một hạng mục.');
      return;
    }

    const linkedCount = transactions.filter(t => t.category === catId && t.type === catType).length;
    if (linkedCount > 0) {
      const confirmed = window.confirm(
        `Hạng mục này đang có ${linkedCount} giao dịch. Các giao dịch cũ vẫn giữ nguyên thông tin. Bạn có chắc muốn xóa?`
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    setCatActionError('');
    try {
      const newCategories = {
        ...categories,
        [catType]: list.filter(c => c.id !== catId),
      };
      await onUpdateCategories(newCategories);
    } catch (err) {
      setCatActionError(err.message || 'Không thể xóa hạng mục.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cài đặt hệ thống</h2>
        <p className={styles.subtitle}>Quản lý ngân sách, thành viên gia đình và hạng mục chi tiêu</p>
      </div>

      {/* Tabs navigation */}
      <div className={styles.navTabs}>
        <button
          className={`${styles.navTab} ${activeTab === 'budget' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <Target size={18} />
          <span>Ngân sách & Sao lưu</span>
        </button>
        <button
          className={`${styles.navTab} ${activeTab === 'members' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={18} />
          <span>Thành viên gia đình ({familyMembers.length})</span>
        </button>
        <button
          className={`${styles.navTab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Layers size={18} />
          <span>Hạng mục thu & chi</span>
        </button>
        <button
          className={`${styles.navTab} ${activeTab === 'integrations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Bot size={18} />
          <span>Bot & Trí tuệ AI</span>
        </button>
      </div>

      {/* TAB 1: BUDGET & BACKUP */}
      {activeTab === 'budget' && (
        <div className={styles.tabContent}>
          {/* Monthly Budget */}
          <div className={`card ${styles.section}`}>
            <div className={styles.sectionHeader}>
              <Target size={20} color="#F59E0B" />
              <h3>Ngân sách hàng tháng</h3>
            </div>
            <p className={styles.desc}>
              Mức trần chi tiêu dự kiến trong tháng của gia đình. Hiện tại:{' '}
              <strong>{formatCurrency(data?.monthlyBudget || 0)}</strong>
            </p>
            <div className={styles.budgetRow}>
              <input
                type="text"
                className="input"
                placeholder="Nhập ngân sách..."
                value={budgetInput ? parseInt(budgetInput, 10).toLocaleString('vi-VN') : ''}
                onChange={(e) => setBudgetInput(e.target.value.replace(/[^\d]/g, ''))}
              />
              <button className="btn btn-primary" onClick={handleBudgetSave} disabled={isSaving}>
                {isSaving ? 'Đang lưu…' : 'Lưu'}
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
              Xuất dữ liệu toàn bộ (giao dịch, ngân sách, thành viên, danh mục tùy biến) ra file JSON để lưu trữ an toàn hoặc chuyển sang thiết bị khác.
            </p>
            <div className={styles.actionRow}>
              <button className="btn btn-ghost" onClick={handleExport} disabled={isSaving}>
                <Download size={16} />
                Xuất file sao lưu (JSON)
              </button>
              <label className="btn btn-ghost" style={{ cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}>
                <Upload size={16} />
                Nhập file sao lưu
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isSaving}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Reset */}
          <div className={`card ${styles.section} ${styles.dangerSection}`}>
            <div className={styles.sectionHeader}>
              <AlertTriangle size={20} color="#E11D48" />
              <h3>Khôi phục dữ liệu mẫu ban đầu</h3>
            </div>
            <p className={styles.desc}>
              Xóa toàn bộ giao dịch hiện tại và nạp lại 20 giao dịch mẫu. Hành động này không thể hoàn tác.
            </p>
            {!showConfirm ? (
              <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>
                <RefreshCw size={14} />
                Reset về dữ liệu mẫu
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <p className={styles.confirmText}>Bạn chắc chắn muốn xóa tất cả giao dịch?</p>
                <div className={styles.confirmBtns}>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      setStatus('');
                      try {
                        await onReset();
                        setStatus('Đã khôi phục dữ liệu mẫu thành công.');
                        setShowConfirm(false);
                      } catch (error) {
                        setStatus(error.message || 'Không thể khôi phục dữ liệu mẫu.');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    Xóa và nạp dữ liệu mẫu
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FAMILY MEMBERS */}
      {activeTab === 'members' && (
        <div className={styles.tabContent}>
          <div className={`card ${styles.section}`}>
            <div className={styles.sectionHeaderBetween}>
              <div className={styles.sectionHeader}>
                <Users size={20} color="#7C3AED" />
                <h3>Thành viên gia đình</h3>
              </div>
              {!showAddMember && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingMemberId(null);
                    setNewMemberName('');
                    setNewMemberAvatar('👨');
                    setNewMemberColor(COLOR_PALETTE[0]);
                    setShowAddMember(true);
                  }}
                >
                  <Plus size={16} />
                  Thêm thành viên
                </button>
              )}
            </div>

            {memberActionError && (
              <div className={styles.errorBox}>{memberActionError}</div>
            )}

            {/* Add / Edit Form */}
            {showAddMember && (
              <form onSubmit={handleSaveMember} className={styles.editorBox}>
                <div className={styles.editorHeader}>
                  <h4>{editingMemberId ? 'Sửa thông tin thành viên' : 'Thêm thành viên mới'}</h4>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => { setShowAddMember(false); setEditingMemberId(null); }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label className="label">Tên gọi (ví dụ: Bố, Mẹ, Bà nội, Bé Bông)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nhập tên thành viên..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className="label">Chọn biểu tượng đại diện</label>
                  <div className={styles.avatarPicker}>
                    {AVATAR_OPTIONS.map(av => (
                      <button
                        type="button"
                        key={av}
                        className={`${styles.avatarChoice} ${newMemberAvatar === av ? styles.avatarChoiceSelected : ''}`}
                        onClick={() => setNewMemberAvatar(av)}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className="label">Màu sắc định danh</label>
                  <div className={styles.colorPicker}>
                    {COLOR_PALETTE.map(c => (
                      <button
                        type="button"
                        key={c}
                        className={`${styles.colorChoice} ${newMemberColor === c ? styles.colorChoiceSelected : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewMemberColor(c)}
                      >
                        {newMemberColor === c && <Check size={14} color="#FFF" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.editorActions}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setShowAddMember(false); setEditingMemberId(null); }}
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!newMemberName.trim() || isSaving}
                  >
                    {isSaving ? 'Đang lưu…' : editingMemberId ? 'Cập nhật' : 'Thêm vào gia đình'}
                  </button>
                </div>
              </form>
            )}

            {/* List members */}
            <div className={styles.memberList}>
              {familyMembers.map(m => {
                const count = transactions.filter(t => t.member === m.id).length;
                return (
                  <div key={m.id} className={styles.memberCard}>
                    <div className={styles.memberCardLeft}>
                      <div
                        className={styles.memberAvatarBig}
                        style={{ borderColor: m.color, background: m.color + '15' }}
                      >
                        {m.avatar}
                      </div>
                      <div>
                        <h4 className={styles.memberName}>{m.name}</h4>
                        <span className={styles.memberSub}>
                          {count > 0 ? `${count} giao dịch đã ghi` : 'Chưa có giao dịch'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.memberCardActions}>
                      <button
                        className={styles.iconActionBtn}
                        onClick={() => startEditMember(m)}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                        onClick={() => handleDeleteMember(m.id)}
                        title="Xóa thành viên"
                        disabled={familyMembers.length <= 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className={styles.tabContent}>
          <div className={`card ${styles.section}`}>
            <div className={styles.sectionHeaderBetween}>
              <div className={styles.sectionHeader}>
                <Layers size={20} color="#059669" />
                <h3>Hạng mục chi tiêu & thu nhập</h3>
              </div>
              {!showAddCategory && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setNewCatName('');
                    setNewCatIcon(catType === 'expense' ? 'ShoppingBag' : 'Banknote');
                    setNewCatColor(COLOR_PALETTE[0]);
                    setShowAddCategory(true);
                  }}
                >
                  <Plus size={16} />
                  Thêm hạng mục
                </button>
              )}
            </div>

            {/* Sub-toggle: Chi tiền vs Thu tiền */}
            <div className={styles.catTypeToggle}>
              <button
                className={`${styles.catTypeBtn} ${catType === 'expense' ? styles.catTypeActiveExpense : ''}`}
                onClick={() => { setCatType('expense'); setShowAddCategory(false); }}
              >
                Hạng mục chi tiền ({categories?.expense?.length || 0})
              </button>
              <button
                className={`${styles.catTypeBtn} ${catType === 'income' ? styles.catTypeActiveIncome : ''}`}
                onClick={() => { setCatType('income'); setShowAddCategory(false); }}
              >
                Hạng mục thu tiền ({categories?.income?.length || 0})
              </button>
            </div>

            {catActionError && (
              <div className={styles.errorBox}>{catActionError}</div>
            )}

            {/* Add / Edit Category Form */}
            {showAddCategory && (
              <form onSubmit={handleSaveCategory} className={styles.editorBox}>
                <div className={styles.editorHeader}>
                  <h4>
                    {editingCategoryId ? 'Sửa hạng mục' : `Thêm hạng mục ${catType === 'expense' ? 'chi' : 'thu'} mới`}
                  </h4>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => { setShowAddCategory(false); setEditingCategoryId(null); }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label className="label">Tên hạng mục (ví dụ: Nuôi thú cưng, Thể thao, Trả góp)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nhập tên hạng mục..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className="label">Chọn biểu tượng (Icon)</label>
                  <div className={styles.iconPickerGrid}>
                    {AVAILABLE_ICONS.map(iconName => {
                      const IconComp = ICON_MAP[iconName] || MoreHorizontal;
                      const isSelected = newCatIcon === iconName;
                      return (
                        <button
                          type="button"
                          key={iconName}
                          className={`${styles.iconChoice} ${isSelected ? styles.iconChoiceSelected : ''}`}
                          onClick={() => setNewCatIcon(iconName)}
                          title={iconName}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className="label">Màu sắc hiển thị</label>
                  <div className={styles.colorPicker}>
                    {COLOR_PALETTE.map(c => (
                      <button
                        type="button"
                        key={c}
                        className={`${styles.colorChoice} ${newCatColor === c ? styles.colorChoiceSelected : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewCatColor(c)}
                      >
                        {newCatColor === c && <Check size={14} color="#FFF" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.editorActions}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setShowAddCategory(false); setEditingCategoryId(null); }}
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!newCatName.trim() || isSaving}
                  >
                    {isSaving ? 'Đang lưu…' : editingCategoryId ? 'Cập nhật' : 'Lưu hạng mục'}
                  </button>
                </div>
              </form>
            )}

            {/* List Categories */}
            <div className={styles.categoryList}>
              {currentCategories.map(cat => {
                const IconComponent = ICON_MAP[cat.icon] || MoreHorizontal;
                const count = transactions.filter(t => t.category === cat.id && t.type === catType).length;
                return (
                  <div key={cat.id} className={styles.catCard}>
                    <div className={styles.catCardLeft}>
                      <div
                        className={styles.catIconWrap}
                        style={{ background: cat.color + '18', color: cat.color }}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h4 className={styles.catName}>{cat.name}</h4>
                        <span className={styles.catSub}>
                          {count > 0 ? `${count} giao dịch` : 'Chưa có giao dịch'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.memberCardActions}>
                      <button
                        className={styles.iconActionBtn}
                        onClick={() => startEditCategory(cat)}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                        onClick={() => handleDeleteCategory(cat.id)}
                        title="Xóa hạng mục"
                        disabled={currentCategories.length <= 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BOT & AI INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className={styles.tabContent}>
          {/* Telegram Bot Card */}
          <div className={`card ${styles.section}`}>
            <div className={styles.sectionHeaderBetween}>
              <div className={styles.sectionHeader}>
                <Send size={20} color="#06B6D4" />
                <h3>Thông báo Telegram (Bot JAVIS)</h3>
              </div>
              <span className={styles.activeBadge}>
                <Check size={14} /> Đang kết nối
              </span>
            </div>
            <p className={styles.desc}>
              Bot <strong>JAVIS (@Javisreport_bot)</strong> đã được kết nối với Nhóm gia đình <strong>Buddy (-1003980067278)</strong>.
              Mỗi khi bạn hoặc thành viên trong nhà thêm khoản chi tiêu hay thu nhập mới, bot sẽ lập tức gửi thông báo trực quan vào nhóm!
            </p>
            <div className={styles.integrationInfoBox}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tên Bot:</span>
                <span className={styles.infoValue}>JAVIS (@Javisreport_bot)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nhóm nhận tin:</span>
                <span className={styles.infoValue}>Buddy (Chat ID: -1003980067278)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Cơ chế hoạt động:</span>
                <span className={styles.infoValue}>Tự động 100% khi có giao dịch mới</span>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSmokeTest}
                disabled={isSendingSmoke}
              >
                <Send size={15} />
                {isSendingSmoke ? 'Đang bắn tin test...' : 'Bắn tin thử nghiệm vào nhóm (Smoke Test)'}
              </button>
            </div>

            {smokeTestStatus && (
              <div className={smokeTestStatus.startsWith('Lỗi') ? styles.errorBox : styles.status} style={{ marginTop: '14px' }}>
                {smokeTestStatus}
              </div>
            )}
          </div>

          {/* Gemini AI Card */}
          <div className={`card ${styles.section}`}>
            <div className={styles.sectionHeaderBetween}>
              <div className={styles.sectionHeader}>
                <Sparkles size={20} color="#7C3AED" />
                <h3>Trợ lý Tài chính Gemini AI</h3>
              </div>
              <span className={styles.activeBadge} style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                <Check size={14} /> Gemini 2.5 Flash
              </span>
            </div>
            <p className={styles.desc}>
              Đã kích hoạt trợ lý AI thông minh qua nút <strong>Bong bóng nổi (Floating Widget)</strong> ở góc dưới bên phải màn hình.
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                ✨ <strong>Hỏi đáp tài chính tự nhiên:</strong> Hỏi bất kỳ điều gì về tổng thu chi, ai tiêu nhiều nhất, danh mục tốn kém nhất.
              </div>
              <div className={styles.featureItem}>
                ⚡ <strong>Ghi chép giao dịch siêu tốc:</strong> Chỉ cần gõ <em>"Vừa đổ xăng 50k"</em> hay <em>"Mẹ mua rau 30k"</em>, AI sẽ tự động phân tích và tạo sẵn nút thêm vào sổ chỉ với 1 chạm!
              </div>
              <div className={styles.featureItem}>
                💡 <strong>Cố vấn tiết kiệm gia đình:</strong> Đưa ra nhận xét thực tế, thân thiện, không dùng câu từ máy móc (không AI slop).
              </div>
            </div>
          </div>
        </div>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}
