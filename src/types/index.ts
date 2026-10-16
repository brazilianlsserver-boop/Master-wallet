export interface User {
  phone: string;
  id: string;
  name: string;
  password?: string;
  token?: string;
  isLoggedIn: boolean;
  pin: string;
  inviteCode: string;
  isBanned?: boolean;
  role?: 'user' | 'admin';
  createdAt?: string;
  balance?: number;
  ordersCount?: number;
  referredBy?: string;
}

export interface Wallet {
  id: string;
  type: 'Paytm' | 'Freecharge' | 'MoneyView' | 'FamPay' | 'UPI' | 'USDT-TRC20' | 'Bank Card';
  accountName: string;
  accountNumber: string; // Phone or UPI ID or Card Number or TRC20 address
  ifsc?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ClaimOrder {
  id: string;
  currency: string;
  amount: number;
  income: number;
  category: '100-499' | '500-1999' | '2000-4999' | '5000+';
  status: 'available' | 'claimed' | 'processing' | 'completed' | 'cancelled';
  claimedAt?: string;
  cancelledAt?: string;
  payeeAccount?: string;
  payeeName?: string;
  ifsc?: string;
  transferType?: string;
  payoutWallet?: string;
  payoutAccount?: string;
  payoutUpi?: string;
  orderNo?: string;
  utr?: string;
  userId?: string;
  userPhone?: string;
  userName?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'claim_income' | 'commission' | 'referral';
  amount: number;
  status: 'completed' | 'processing' | 'failed';
  title: string;
  date: string;
  walletType?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  unread: boolean;
  priority?: 'normal' | 'urgent';
  targetPhone?: string;
}

export interface AppState {
  balance: number;
  depositTotal: number;
  withdrawalTotal: number;
  commissionTotal: number;
  sellTotal: number;
  rewardTotal: number;
  pendingTotal: number;
  inProcessAmount: number;
  inProcessOrders: number;
  commissionRate: number; // e.g. 4.2
  usdtRate: number; // e.g. 112
  isSellingActive: boolean;
  integralPoints: number;
  welcomeBonusAmount?: number;
  maintenanceMode?: boolean;
}
