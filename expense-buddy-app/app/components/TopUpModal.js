'use client';

import { useState, useEffect, useRef } from 'react';
import { X, QrCode, CheckCircle2, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import styles from './TopUpModal.module.css';

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000];

export default function TopUpModal({ isOpen, onClose, user, onPaymentSuccess }) {
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');
  const pollIntervalRef = useRef(null);

  // Clear polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll for payment completion when paymentData is active
  useEffect(() => {
    if (!paymentData?.orderCode || isPaid) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payos/webhook?orderCode=${paymentData.orderCode}`);
        const result = await res.json();
        if (result?.isPaid) {
          setIsPaid(true);
          clearInterval(pollIntervalRef.current);
          if (onPaymentSuccess) {
            onPaymentSuccess(paymentData.amount);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [paymentData, isPaid, onPaymentSuccess]);

  if (!isOpen) return null;

  const handleSelectPreset = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) setAmount(parseInt(val, 10));
  };

  const handleCreatePayment = async () => {
    if (amount < 1000) {
      setError('Số tiền nạp tối thiểu là 1.000đ.');
      return;
    }
    setError('');
    setIsCreating(true);

    try {
      const res = await fetch('/api/payos/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          member: 'Quỹ chung',
          userId: user?.id,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Lỗi khi tạo mã thanh toán payOS.');
      }

      setPaymentData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setPaymentData(null);
    setIsPaid(false);
    setError('');
    setAmount(50000);
    setCustomAmount('');
    onClose();
  };

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + 'đ';

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {!paymentData ? (
          <div className={styles.createStep}>
            <div className={styles.header}>
              <div className={styles.iconWrap}>
                <QrCode size={26} />
              </div>
              <h2>Nạp Quỹ Gia Đình (VietQR)</h2>
              <p>Tạo mã QR thanh toán qua payOS, quét chuyển khoản ngân hàng 24/7.</p>
            </div>

            <div className={styles.body}>
              <label className={styles.label}>Chọn số tiền nạp</label>
              <div className={styles.presetsGrid}>
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.presetBtn} ${amount === val && !customAmount ? styles.active : ''}`}
                    onClick={() => handleSelectPreset(val)}
                  >
                    {formatVND(val)}
                  </button>
                ))}
              </div>

              <label className={styles.label} style={{ marginTop: '14px' }}>
                Hoặc nhập số tiền khác
              </label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  value={customAmount ? new Intl.NumberFormat('vi-VN').format(customAmount) : ''}
                  onChange={handleCustomChange}
                  placeholder="Ví dụ: 150.000"
                />
                <span className={styles.unit}>VNĐ</span>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px' }}
                onClick={handleCreatePayment}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 size={18} className={styles.spin} /> Đang tạo mã VietQR...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Tạo mã VietQR ({formatVND(amount)})
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.paymentStep}>
            {isPaid ? (
              <div className={styles.successState}>
                <CheckCircle2 size={64} className={styles.successIcon} />
                <h3>Nạp Quỹ Thành Công! 🎉</h3>
                <p className={styles.successAmount}>+{formatVND(paymentData.amount)}</p>
                <p className={styles.successDesc}>
                  Giao dịch đã được ghi nhận vào <strong>Quỹ chung</strong> và đồng bộ lên hệ thống.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleClose}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <div className={styles.qrState}>
                <div className={styles.qrHeader}>
                  <h3>Quét mã để thanh toán</h3>
                  <p className={styles.amountHighlight}>{formatVND(paymentData.amount)}</p>
                  <span className={styles.orderBadge}>Mã đơn: #{paymentData.orderCode}</span>
                </div>

                <div className={styles.qrFrame}>
                  {paymentData.qrCode ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        paymentData.qrCode
                      )}`}
                      alt="VietQR payOS"
                      className={styles.qrImage}
                    />
                  ) : (
                    <div className={styles.qrLoading}>Đang tải mã QR...</div>
                  )}
                </div>

                <div className={styles.waitingStatus}>
                  <Loader2 size={16} className={styles.spin} />
                  <span>Đang chờ bạn quét mã và chuyển tiền...</span>
                </div>

                <div className={styles.actions}>
                  {paymentData.checkoutUrl && (
                    <a
                      href={paymentData.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkOut}
                    >
                      Mở trang cổng payOS <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
