// Mock data generator & LocalStorage utility for Expense Buddy

const FAMILY_MEMBERS = [
  { id: 'bo', name: 'Bố', avatar: '👨', color: '#7C3AED' },
  { id: 'me', name: 'Mẹ', avatar: '👩', color: '#E11D48' },
  { id: 'bebo', name: 'Bé Bo', avatar: '👦', color: '#F59E0B' },
  { id: 'chung', name: 'Quỹ chung', avatar: '🏠', color: '#059669' },
];

const CATEGORIES = {
  expense: [
    { id: 'food', name: 'Ăn uống', icon: 'UtensilsCrossed', color: '#F97316' },
    { id: 'market', name: 'Đi chợ', icon: 'ShoppingCart', color: '#10B981' },
    { id: 'electric', name: 'Điện nước', icon: 'Zap', color: '#FBBF24' },
    { id: 'education', name: 'Học phí', icon: 'GraduationCap', color: '#8B5CF6' },
    { id: 'health', name: 'Y tế', icon: 'Heart', color: '#EF4444' },
    { id: 'transport', name: 'Di chuyển', icon: 'Car', color: '#3B82F6' },
    { id: 'shopping', name: 'Mua sắm', icon: 'ShoppingBag', color: '#EC4899' },
    { id: 'entertainment', name: 'Giải trí', icon: 'Gamepad2', color: '#06B6D4' },
    { id: 'other_expense', name: 'Khác', icon: 'MoreHorizontal', color: '#6B7280' },
  ],
  income: [
    { id: 'salary', name: 'Lương', icon: 'Banknote', color: '#10B981' },
    { id: 'bonus', name: 'Thưởng', icon: 'Gift', color: '#F59E0B' },
    { id: 'investment', name: 'Đầu tư', icon: 'TrendingUp', color: '#3B82F6' },
    { id: 'freelance', name: 'Thu nhập phụ', icon: 'Briefcase', color: '#8B5CF6' },
    { id: 'other_income', name: 'Khác', icon: 'MoreHorizontal', color: '#6B7280' },
  ],
};

const STORAGE_KEY = 'expense-buddy-data';

// TTL: 3 hours in milliseconds
const DATA_TTL_MS = 3 * 60 * 60 * 1000;

function generateMockData() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const mockTransactions = [
    // Income
    { id: '1', type: 'income', amount: 25000000, category: 'salary', member: 'bo', note: 'Lương tháng 8', date: new Date(currentYear, currentMonth, 1).toISOString() },
    { id: '2', type: 'income', amount: 18000000, category: 'salary', member: 'me', note: 'Lương tháng 8', date: new Date(currentYear, currentMonth, 1).toISOString() },
    { id: '3', type: 'income', amount: 3000000, category: 'bonus', member: 'bo', note: 'Thưởng dự án', date: new Date(currentYear, currentMonth, 10).toISOString() },
    { id: '4', type: 'income', amount: 2000000, category: 'freelance', member: 'me', note: 'Dạy thêm online', date: new Date(currentYear, currentMonth, 15).toISOString() },

    // Expenses
    { id: '5', type: 'expense', amount: 60000, category: 'food', member: 'bo', note: 'Cà phê sáng', date: new Date(currentYear, currentMonth, 2).toISOString() },
    { id: '6', type: 'expense', amount: 850000, category: 'market', member: 'me', note: 'Đi chợ tuần', date: new Date(currentYear, currentMonth, 3).toISOString() },
    { id: '7', type: 'expense', amount: 1200000, category: 'electric', member: 'chung', note: 'Tiền điện tháng 7', date: new Date(currentYear, currentMonth, 5).toISOString() },
    { id: '8', type: 'expense', amount: 450000, category: 'electric', member: 'chung', note: 'Tiền nước', date: new Date(currentYear, currentMonth, 5).toISOString() },
    { id: '9', type: 'expense', amount: 3500000, category: 'education', member: 'bebo', note: 'Học phí lớp vẽ', date: new Date(currentYear, currentMonth, 6).toISOString() },
    { id: '10', type: 'expense', amount: 150000, category: 'food', member: 'chung', note: 'Ăn phở cuối tuần', date: new Date(currentYear, currentMonth, 7).toISOString() },
    { id: '11', type: 'expense', amount: 120000, category: 'transport', member: 'bo', note: 'Grab đi họp', date: new Date(currentYear, currentMonth, 8).toISOString() },
    { id: '12', type: 'expense', amount: 350000, category: 'health', member: 'bebo', note: 'Khám bệnh định kỳ', date: new Date(currentYear, currentMonth, 9).toISOString() },
    { id: '13', type: 'expense', amount: 550000, category: 'shopping', member: 'me', note: 'Mua quần áo con', date: new Date(currentYear, currentMonth, 11).toISOString() },
    { id: '14', type: 'expense', amount: 250000, category: 'entertainment', member: 'chung', note: 'Xem phim gia đình', date: new Date(currentYear, currentMonth, 13).toISOString() },
    { id: '15', type: 'expense', amount: 200000, category: 'food', member: 'me', note: 'Mua trái cây', date: new Date(currentYear, currentMonth, 14).toISOString() },
    { id: '16', type: 'expense', amount: 1800000, category: 'market', member: 'me', note: 'Đi siêu thị cuối tuần', date: new Date(currentYear, currentMonth, 15).toISOString() },
    { id: '17', type: 'expense', amount: 500000, category: 'transport', member: 'me', note: 'Xăng xe tháng', date: new Date(currentYear, currentMonth, 16).toISOString() },
    { id: '18', type: 'expense', amount: 2200000, category: 'education', member: 'bebo', note: 'Học tiếng Anh', date: new Date(currentYear, currentMonth, 17).toISOString() },
    { id: '19', type: 'expense', amount: 180000, category: 'food', member: 'bo', note: 'Trà đá đãi bạn', date: new Date(currentYear, currentMonth, 18).toISOString() },
    { id: '20', type: 'expense', amount: 950000, category: 'market', member: 'me', note: 'Mua thực phẩm tuần', date: new Date(currentYear, currentMonth, 20).toISOString() },
  ];

  return {
    transactions: mockTransactions,
    monthlyBudget: 35000000,
  };
}

// LocalStorage helpers — with 3-hour TTL
function loadData() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const wrapper = JSON.parse(stored);

      // Check TTL: if savedAt exists, verify not expired
      if (wrapper.savedAt) {
        const elapsed = Date.now() - wrapper.savedAt;
        if (elapsed > DATA_TTL_MS) {
          // Data expired — clear and return null to trigger re-seed
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
      }

      // Support both old format (no wrapper) and new format
      if (wrapper.payload) {
        return wrapper.payload;
      }
      // Legacy: data saved without TTL wrapper (transactions at top level)
      if (wrapper.transactions) {
        return wrapper;
      }
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return null;
}

function saveData(data) {
  if (typeof window === 'undefined') return;
  try {
    const wrapper = {
      savedAt: Date.now(),
      payload: data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// Returns remaining TTL in milliseconds, or null if no data
function getRemainingTTL() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const wrapper = JSON.parse(stored);
      if (wrapper.savedAt) {
        const remaining = DATA_TTL_MS - (Date.now() - wrapper.savedAt);
        return Math.max(0, remaining);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function initializeData() {
  const existing = loadData();
  if (existing && existing.transactions && existing.transactions.length > 0) {
    return existing;
  }
  const mock = generateMockData();
  saveData(mock);
  return mock;
}

// Vietnam timezone — all date display pinned to +7
const TIMEZONE = 'Asia/Ho_Chi_Minh';

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: TIMEZONE });
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIMEZONE });
}

function formatMonthYear(date) {
  return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric', timeZone: TIMEZONE });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getCategoryInfo(categoryId, type) {
  const cats = CATEGORIES[type] || CATEGORIES.expense;
  return cats.find(c => c.id === categoryId) || cats[cats.length - 1];
}

function getMemberInfo(memberId) {
  return FAMILY_MEMBERS.find(m => m.id === memberId) || FAMILY_MEMBERS[0];
}

export {
  FAMILY_MEMBERS,
  CATEGORIES,
  STORAGE_KEY,
  DATA_TTL_MS,
  TIMEZONE,
  generateMockData,
  loadData,
  saveData,
  initializeData,
  getRemainingTTL,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatMonthYear,
  generateId,
  getCategoryInfo,
  getMemberInfo,
};
