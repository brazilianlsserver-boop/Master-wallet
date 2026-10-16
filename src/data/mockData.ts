import { ClaimOrder, Transaction, User, Wallet, Announcement } from '../types';

export const initialUser: User = {
  phone: '7425831902',
  id: '316568',
  name: 'OK User',
  password: 'password123',
  isLoggedIn: false,
  pin: '123456',
  inviteCode: '894215',
  role: 'user',
  createdAt: '2026-10-10',
};

export const initialOrders: ClaimOrder[] = [
  {
    id: 'ORD-10001',
    currency: 'INR',
    amount: 10000,
    income: 420,
    category: '5000+',
    status: 'available',
  },
  {
    id: 'ORD-10002',
    currency: 'INR',
    amount: 7000,
    income: 294,
    category: '5000+',
    status: 'available',
  },
  {
    id: 'ORD-10003',
    currency: 'INR',
    amount: 5001,
    income: 210,
    category: '5000+',
    status: 'available',
  },
  {
    id: 'ORD-10004',
    currency: 'INR',
    amount: 3500,
    income: 147,
    category: '2000-4999',
    status: 'available',
  },
  {
    id: 'ORD-10005',
    currency: 'INR',
    amount: 2200,
    income: 92.4,
    category: '2000-4999',
    status: 'available',
  },
  {
    id: 'ORD-10006',
    currency: 'INR',
    amount: 1500,
    income: 63,
    category: '500-1999',
    status: 'available',
  },
  {
    id: 'ORD-10007',
    currency: 'INR',
    amount: 800,
    income: 33.6,
    category: '500-1999',
    status: 'available',
  },
  {
    id: 'ORD-10008',
    currency: 'INR',
    amount: 450,
    income: 18.9,
    category: '100-499',
    status: 'available',
  },
  {
    id: 'ORD-10009',
    currency: 'INR',
    amount: 200,
    income: 8.4,
    category: '100-499',
    status: 'available',
  },
  {
    id: 'ORD-10010',
    currency: 'INR',
    amount: 220,
    income: 9.24,
    category: '100-499',
    status: 'available',
    payeeAccount: '0500201700020304',
    payeeName: 'ghjff',
    ifsc: 'PUNB0050020',
    transferType: 'IMPS',
    payoutWallet: 'Mobikwik',
    payoutAccount: '8949263502',
    payoutUpi: '8949263502@mbkns',
    orderNo: 'R2026101118241395424989',
  },
];

export const initialTransactions: Transaction[] = [];

export const initialWallets: Wallet[] = [];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'm1',
    title: 'Welcome to OK PAY v1.0.6',
    content:
      'Thank you for joining OK PAY! Enjoy our 4.2% cashback rebate on verified merchant payment claims.',
    date: 'Today, 14:30',
    unread: false,
    priority: 'normal',
  },
  {
    id: 'm2',
    title: 'Important Wallet Notice',
    content:
      'Please ensure you use Freecharge, Paytm, or MoneyView wallet channels for fastest automatic settlement.',
    date: 'Today, 10:15',
    unread: true,
    priority: 'urgent',
  },
  {
    id: 'm3',
    title: 'USDT Exchange Rate Update',
    content:
      'Real-time rate fixed at 112 INR per USDT for today. Instant liquidity guaranteed.',
    date: 'Yesterday',
    unread: false,
    priority: 'normal',
  },
];
