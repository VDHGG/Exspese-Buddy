'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Sparkles, Check,
  Bot, CornerDownLeft, AlertCircle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, getCategoryInfo, getMemberInfo } from '../lib/data';
import styles from './FloatingChatWidget.module.css';

const QUICK_CHIPS = [
  'Tháng này chi tiêu thế nào?',
  'Ai đang tiêu nhiều nhất?',
  'Vừa ăn trưa 45k',
  'Gợi ý tiết kiệm tháng này',
];

function resolveCategory(raw, type, categories) {
  const cats = (categories && categories[type]) || [];
  if (!raw) return cats[0]?.id || (type === 'expense' ? 'other_expense' : 'other_income');

  const clean = String(raw).toLowerCase().trim();
  const byId = cats.find(c => c.id.toLowerCase() === clean);
  if (byId) return byId.id;

  const byName = cats.find(c => c.name.toLowerCase() === clean || c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase()));
  if (byName) return byName.id;

  // Keyword matching
  if (clean.includes('xăng') || clean.includes('xe') || clean.includes('grab') || clean.includes('transport')) {
    const t = cats.find(c => c.id === 'transport');
    if (t) return t.id;
  }
  if (clean.includes('ăn') || clean.includes('phở') || clean.includes('cơm') || clean.includes('food') || clean.includes('cafe') || clean.includes('cà phê')) {
    const f = cats.find(c => c.id === 'food');
    if (f) return f.id;
  }
  if (clean.includes('chợ') || clean.includes('siêu thị') || clean.includes('thịt') || clean.includes('rau') || clean.includes('market')) {
    const m = cats.find(c => c.id === 'market');
    if (m) return m.id;
  }
  if (clean.includes('điện') || clean.includes('nước') || clean.includes('mạng') || clean.includes('wifi')) {
    const el = cats.find(c => c.id === 'electric');
    if (el) return el.id;
  }
  if (clean.includes('học') || clean.includes('sách') || clean.includes('vở')) {
    const ed = cats.find(c => c.id === 'education');
    if (ed) return ed.id;
  }
  if (clean.includes('lương') || clean.includes('salary')) {
    const s = cats.find(c => c.id === 'salary');
    if (s) return s.id;
  }
  if (clean.includes('thưởng') || clean.includes('bonus')) {
    const b = cats.find(c => c.id === 'bonus');
    if (b) return b.id;
  }

  return cats[0]?.id || (type === 'expense' ? 'other_expense' : 'other_income');
}

function resolveMember(raw, familyMembers) {
  const members = familyMembers || [];
  if (!raw || members.length === 0) return members[0]?.id || 'bo';

  const clean = String(raw).toLowerCase().trim();
  const byId = members.find(m => m.id.toLowerCase() === clean);
  if (byId) return byId.id;

  const byName = members.find(m => m.name.toLowerCase() === clean || m.name.toLowerCase().includes(clean) || clean.includes(m.name.toLowerCase()));
  if (byName) return byName.id;

  return members[0]?.id || 'bo';
}

export default function FloatingChatWidget({
  data,
  stats,
  onAddTransaction,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Chào bạn! Mình là JAVIS — trợ lý tài chính gia đình. Bạn cần xem báo cáo chi tiêu hay muốn mình ghi lại khoản tiền nào không?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedActions, setAddedActions] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          context: {
            monthlyBudget: data?.monthlyBudget || 35000000,
            stats,
            categories: data?.categories,
            familyMembers: data?.familyMembers,
          },
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.ok) {
        throw new Error(resData.error || 'Không thể kết nối tới JAVIS AI.');
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: resData.reply || 'Mình đã nhận được yêu cầu.',
        actionData: resData.actionData,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `Rất tiếc: ${err.message || 'Đã có lỗi xảy ra khi kết nối trợ lý.'}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAddTransaction = async (msgId, actionData) => {
    if (!actionData || !onAddTransaction) return;

    try {
      const type = actionData.type === 'income' ? 'income' : 'expense';
      const categoryId = resolveCategory(actionData.category, type, data?.categories);
      const memberId = resolveMember(actionData.member, data?.familyMembers);
      const amountVal = Math.abs(parseInt(actionData.amount, 10)) || 0;
      const noteVal = actionData.note || actionData.description || actionData.content || '';

      if (amountVal <= 0) {
        alert('Số tiền không hợp lệ.');
        return;
      }

      await onAddTransaction({
        type,
        amount: amountVal,
        category: categoryId,
        member: memberId,
        note: noteVal,
        date: new Date().toISOString(),
      });

      setAddedActions(prev => ({ ...prev, [msgId]: true }));
    } catch (err) {
      alert('Không thể lưu giao dịch: ' + err.message);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`${styles.triggerBtn} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở trợ lý tài chính JAVIS"
        title="Trợ lý JAVIS AI"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className={styles.triggerInner}>
            <Bot size={26} />
            <span className={styles.sparkleDot}>
              <Sparkles size={12} />
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.botAvatarBadge}>
              <Bot size={20} />
            </div>
            <div className={styles.chatHeaderText}>
              <h4>Trợ lý JAVIS AI</h4>
              <span className={styles.statusText}>
                <span className={styles.onlineDot} /> Trực tuyến · Gemini 2.5 Flash
              </span>
            </div>
            <button
              className={styles.closeHeaderBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Thu nhỏ chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick chips */}
          <div className={styles.chipsScroll}>
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                className={styles.chip}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className={styles.messagesContainer}>
            {messages.map(m => {
              const isBot = m.role === 'model';
              const action = m.actionData;
              const isAdded = addedActions[m.id];

              const catInfo = action
                ? getCategoryInfo(action.category, action.type, data?.categories)
                : null;
              const memInfo = action
                ? getMemberInfo(action.member, data?.familyMembers)
                : null;

              return (
                <div
                  key={m.id}
                  className={`${styles.messageWrap} ${isBot ? styles.msgBot : styles.msgUser}`}
                >
                  {isBot && (
                    <div className={styles.botAvatarMini}>
                      <Bot size={14} />
                    </div>
                  )}

                  <div className={styles.bubbleContent}>
                    <div
                      className={`${styles.bubble} ${isBot ? styles.bubbleBot : styles.bubbleUser} ${m.isError ? styles.bubbleError : ''}`}
                    >
                      {m.text}
                    </div>

                    {/* Interactive Action Card if Gemini detected a transaction */}
                    {action && (
                      <div className={styles.actionCard}>
                        <div className={styles.actionCardHeader}>
                          <span className={styles.actionCardTitle}>
                            {action.type === 'expense' ? 'Giao dịch chi tiêu phát hiện:' : 'Giao dịch thu nhập phát hiện:'}
                          </span>
                        </div>
                        <div className={styles.actionCardBody}>
                          <div className={styles.actionAmount}>
                            {action.type === 'expense' ? (
                              <ArrowDownRight size={16} color="#E11D48" />
                            ) : (
                              <ArrowUpRight size={16} color="#059669" />
                            )}
                            <strong>{formatCurrency(action.amount)}</strong>
                          </div>
                          <div className={styles.actionBadges}>
                            <span className={styles.badge}>
                              {catInfo ? catInfo.name : action.category}
                            </span>
                            <span className={styles.badge}>
                              {memInfo ? `${memInfo.avatar} ${memInfo.name}` : action.member}
                            </span>
                            {action.note && <span className={styles.actionNote}>"{action.note}"</span>}
                          </div>
                        </div>
                        <div className={styles.actionCardFooter}>
                          {isAdded ? (
                            <span className={styles.addedNotice}>
                              <Check size={14} /> Đã thêm vào sổ & gửi Telegram
                            </span>
                          ) : (
                            <button
                              className={`btn btn-primary btn-sm ${styles.confirmBtn}`}
                              onClick={() => handleConfirmAddTransaction(m.id, action)}
                            >
                              <Check size={14} />
                              Xác nhận thêm vào sổ
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className={`${styles.messageWrap} ${styles.msgBot}`}>
                <div className={styles.botAvatarMini}>
                  <Bot size={14} />
                </div>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  <div className={styles.typingDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className={styles.inputArea}
          >
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Nhắn JAVIS (ví dụ: 'Vừa đổ xăng 50k')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim() || isLoading}
              aria-label="Gửi tin nhắn"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
