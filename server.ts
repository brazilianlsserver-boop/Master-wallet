import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory + file-backed persistent database
const DB_FILE = path.join(__dirname, 'data_store.json');

interface UserData {
  phone: string;
  id: string;
  name: string;
  password?: string;
  pin?: string;
  inviteCode?: string;
  referredBy?: string;
  role: 'admin' | 'user';
  isLoggedIn: boolean;
  createdAt: string;
  balance: number;
  isBanned?: boolean;
}

interface ClaimOrderData {
  id: string;
  currency: string;
  amount: number;
  income: number;
  category: string;
  status: 'available' | 'claimed' | 'processing' | 'completed' | 'cancelled';
  claimedAt?: string;
  cancelledAt?: string;
  utr?: string;
  userId?: string;
  userPhone?: string;
  userName?: string;
  payoutWallet?: string;
  payoutAccount?: string;
  payoutUpi?: string;
  orderNo?: string;
}

interface DbSchema {
  users: Record<string, UserData>;
  userAccounts: Record<
    string,
    {
      appState: {
        balance: number;
        depositTotal: number;
        withdrawalTotal: number;
        commissionTotal: number;
        sellTotal: number;
        rewardTotal: number;
        pendingTotal: number;
        inProcessAmount: number;
        inProcessOrders: number;
        commissionRate: number;
        usdtRate: number;
        isSellingActive: boolean;
        integralPoints: number;
        welcomeBonusAmount: number;
      };
      orders: ClaimOrderData[];
      transactions: Array<{
        id: string;
        type: string;
        amount: number;
        status: string;
        title: string;
        date: string;
      }>;
      wallets: Array<{
        id: string;
        type: string;
        accountNumber: string;
        accountName: string;
        isDefault?: boolean;
        createdAt: string;
      }>;
      activeOrderId?: string | null;
      lastSavedAt: string;
    }
  >;
  pendingOrders: ClaimOrderData[];
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    unread: boolean;
    priority?: 'normal' | 'urgent';
  }>;
}

const DEFAULT_DB: DbSchema = {
  users: {
    '7425831902': {
      phone: '7425831902',
      id: '316568',
      name: 'OK User',
      password: 'password123',
      pin: '123456',
      inviteCode: '894215',
      role: 'user',
      isLoggedIn: false,
      createdAt: '2026-10-10',
      balance: 100,
    },
    '8949263502': {
      phone: '8949263502',
      id: 'ADMIN-8949',
      name: 'Sagar Master (Admin)',
      password: '7689921898%%%',
      pin: '123456',
      inviteCode: '894926',
      role: 'admin',
      isLoggedIn: false,
      createdAt: '2026-10-10',
      balance: 50000,
    },
  },
  userAccounts: {
    '7425831902': {
      appState: {
        balance: 100,
        depositTotal: 0,
        withdrawalTotal: 0,
        commissionTotal: 42,
        sellTotal: 1000,
        rewardTotal: 30,
        pendingTotal: 0,
        inProcessAmount: 0,
        inProcessOrders: 0,
        commissionRate: 4.2,
        usdtRate: 112,
        isSellingActive: false,
        integralPoints: 100,
        welcomeBonusAmount: 30,
      },
      orders: [],
      transactions: [],
      wallets: [
        {
          id: 'w-1',
          type: 'Mobikwik',
          accountNumber: '8949263502',
          accountName: 'Sagar Master',
          isDefault: true,
          createdAt: '2026-10-10',
        },
      ],
      activeOrderId: null,
      lastSavedAt: new Date().toISOString(),
    },
  },
  pendingOrders: [],
  announcements: [
    {
      id: 'msg-1',
      title: 'Official Internet Cloud Database Connected',
      content:
        'OK PAY is now operating live on cloud internet servers! All user registrations, order claims, and admin approvals sync in real-time across devices.',
      date: 'Today',
      unread: true,
      priority: 'urgent',
    },
  ],
};

function loadDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_DB,
        ...parsed,
        users: { ...DEFAULT_DB.users, ...(parsed.users || {}) },
        userAccounts: { ...DEFAULT_DB.userAccounts, ...(parsed.userAccounts || {}) },
      };
    }
  } catch (err) {
    console.error('Error loading database file:', err);
  }
  return DEFAULT_DB;
}

let db = loadDb();

function saveDb(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

function reloadDb(): DbSchema {
  db = loadDb();
  return db;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // CORS for dev environments
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    reloadDb();
    res.json({
      status: 'ok',
      online: true,
      usersCount: Object.keys(db.users).length,
      pendingCount: db.pendingOrders.length,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Get all registered users (for Admin control & directory)
  app.get('/api/users', (req: Request, res: Response) => {
    reloadDb();
    // Ensure each user has their updated balance and ordersCount from userAccounts
    const populatedUsers: Record<string, any> = {};
    for (const [phone, u] of Object.entries(db.users)) {
      const acc = db.userAccounts[phone];
      const balance = acc?.appState?.balance ?? u.balance ?? 30;
      const ordersCount = (acc?.orders || []).filter(
        (o: any) => o && (o.status === 'completed' || o.status === 'processing' || Boolean(o.utr))
      ).length;
      populatedUsers[phone] = {
        ...u,
        balance,
        ordersCount,
      };
    }
    res.json({ success: true, users: populatedUsers });
  });

  // 2. Register new user over the internet
  app.post('/api/users/register', (req: Request, res: Response) => {
    reloadDb();
    const { phone, name, password, inviteCode } = req.body;
    const trimmed = (phone || '').trim();
    if (!trimmed) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    if (db.users[trimmed]) {
      return res.status(400).json({ success: false, error: 'User already exists with this phone' });
    }

    const existingIds = new Set(Object.values(db.users).map((u) => u.id));
    let uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
    while (existingIds.has(uniqueId)) {
      uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Generate unique personal invite code for the new user so they can invite anyone
    const existingInviteCodes = new Set(Object.values(db.users).map((u) => u.inviteCode));
    let personalInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    while (existingInviteCodes.has(personalInviteCode)) {
      personalInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Check if user was invited by an existing user
    let inviterPhone: string | undefined;
    const trimmedInvite = (inviteCode || '').trim();
    if (trimmedInvite) {
      const inviter = Object.values(db.users).find(
        (u) => u.inviteCode === trimmedInvite || u.phone === trimmedInvite || u.id === trimmedInvite
      );
      if (inviter && inviter.phone !== trimmed) {
        inviterPhone = inviter.phone;
      }
    }

    const newUser: UserData = {
      phone: trimmed,
      id: uniqueId,
      name: name?.trim() || `User_${trimmed.slice(-4)}`,
      password: password || 'password123',
      pin: '123456',
      inviteCode: personalInviteCode,
      referredBy: inviterPhone,
      role: trimmed === '8949263502' ? 'admin' : 'user',
      isLoggedIn: true,
      createdAt: new Date().toISOString().split('T')[0],
      balance: 30, // ₹30 welcome bonus
    };

    db.users[trimmed] = newUser;

    // Send real in-app notification to inviter immediately
    if (inviterPhone) {
      db.announcements.unshift({
        id: `msg-ref-${Date.now()}`,
        title: '🎉 New Referral Joined Your Team!',
        content: `Congratulations! ${newUser.name} (${newUser.phone.slice(0, 4)}****${newUser.phone.slice(-2)}) joined OK PAY using your invite link! You can claim ₹500 from Tasks now!`,
        date: 'Just now',
        unread: true,
        priority: 'urgent',
        targetPhone: inviterPhone,
      });
      if (db.userAccounts[inviterPhone]) {
        db.userAccounts[inviterPhone].transactions.unshift({
          id: `TX-REF-${Date.now()}`,
          type: 'referral',
          amount: 500,
          status: 'completed',
          title: `Referral Joined: ${newUser.name} (Claim ₹500 in Tasks)`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    db.userAccounts[trimmed] = {
      appState: {
        balance: 30,
        depositTotal: 0,
        withdrawalTotal: 0,
        commissionTotal: 0,
        sellTotal: 0,
        rewardTotal: 30,
        pendingTotal: 0,
        inProcessAmount: 0,
        inProcessOrders: 0,
        commissionRate: 4.2,
        usdtRate: 112,
        isSellingActive: false,
        integralPoints: 100,
        welcomeBonusAmount: 30,
      },
      orders: [],
      transactions: [
        {
          id: `TX-WELCOME-${Date.now()}`,
          type: 'claim_income',
          amount: 30,
          status: 'completed',
          title: 'Internet Registration Bonus (+₹30)',
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      wallets: [
        {
          id: `w-${Date.now()}`,
          type: 'Mobikwik',
          accountNumber: '8949263502',
          accountName: 'Sagar Master',
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
      ],
      activeOrderId: null,
      lastSavedAt: new Date().toISOString(),
    };

    saveDb();
    res.json({ success: true, user: newUser, account: db.userAccounts[trimmed] });
  });

  // Login / verify user over internet
  app.post('/api/users/login', (req: Request, res: Response) => {
    reloadDb();
    const { phone, password } = req.body;
    const trimmed = (phone || '').trim();
    if (!trimmed) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    let user = db.users[trimmed];
    if (!user) {
      // Auto-register new user seamlessly with unique 6-digit User ID
      const existingIds = new Set(Object.values(db.users).map((u) => u.id));
      let uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
      while (existingIds.has(uniqueId)) {
        uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
      }

      user = {
        phone: trimmed,
        id: uniqueId,
        name: `OK User ${trimmed.slice(-4)}`,
        password: password || 'password123',
        pin: '123456',
        inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
        role: trimmed === '8949263502' ? 'admin' : 'user',
        isLoggedIn: true,
        createdAt: new Date().toISOString().split('T')[0],
        balance: 30,
      };
      db.users[trimmed] = user;
      db.userAccounts[trimmed] = {
        appState: {
          balance: 30,
          depositTotal: 0,
          withdrawalTotal: 0,
          commissionTotal: 0,
          sellTotal: 0,
          rewardTotal: 30,
          pendingTotal: 0,
          inProcessAmount: 0,
          inProcessOrders: 0,
          commissionRate: 4.2,
          usdtRate: 112,
          isSellingActive: false,
          integralPoints: 100,
          welcomeBonusAmount: 30,
        },
        orders: [],
        transactions: [
          {
            id: `TX-WELCOME-${Date.now()}`,
            type: 'claim_income',
            amount: 30,
            status: 'completed',
            title: 'Welcome Login Reward (+₹30)',
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        wallets: [],
        activeOrderId: null,
        lastSavedAt: new Date().toISOString(),
      };
      saveDb();
      return res.json({ success: true, user, account: db.userAccounts[trimmed], isNewUser: true });
    }

    if (trimmed === '8949263502') {
      if (password !== '7689921898%%%') {
        return res.status(401).json({ success: false, error: 'Incorrect Admin password. Please check your credentials.' });
      }
    } else if (user.password && password && user.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    user.isLoggedIn = true;
    saveDb();
    res.json({ success: true, user, account: db.userAccounts[trimmed] });
  });

  // 3. Sync User Account Data (Read & Write over the internet)
  app.get('/api/user/:phone', (req: Request, res: Response) => {
    reloadDb();
    const phone = req.params.phone.trim();
    const user = db.users[phone];
    const account = db.userAccounts[phone];

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found on cloud server' });
    }

    res.json({
      success: true,
      user,
      account: account || {
        appState: {
          balance: user.balance,
          depositTotal: 0,
          withdrawalTotal: 0,
          commissionTotal: 0,
          sellTotal: 0,
          rewardTotal: 30,
          pendingTotal: 0,
          inProcessAmount: 0,
          inProcessOrders: 0,
          commissionRate: 4.2,
          usdtRate: 112,
          isSellingActive: false,
          integralPoints: 100,
          welcomeBonusAmount: 30,
        },
        orders: [],
        transactions: [],
        wallets: [],
        activeOrderId: null,
        lastSavedAt: new Date().toISOString(),
      },
    });
  });

  app.post('/api/user/:phone/sync', (req: Request, res: Response) => {
    reloadDb();
    const phone = req.params.phone.trim();
    const { user, appState, orders, transactions, wallets, activeOrderId } = req.body;

    const existing = db.users[phone];
    // PERMANENT ID IMMUTABILITY: once created, ID is fixed forever!
    const permanentId = existing?.id || user?.id || Math.floor(100000 + Math.random() * 900000).toString();
    const permanentCreatedAt = existing?.createdAt || user?.createdAt || new Date().toISOString().split('T')[0];
    const permanentInviteCode = existing?.inviteCode || user?.inviteCode || Math.floor(100000 + Math.random() * 900000).toString();

    if (user || existing) {
      db.users[phone] = {
        ...(existing || {}),
        ...(user || {}),
        phone,
        id: permanentId,
        createdAt: permanentCreatedAt,
        inviteCode: permanentInviteCode,
        balance: appState?.balance ?? user?.balance ?? existing?.balance ?? 30,
        role: phone === '8949263502' ? 'admin' : (user?.role || existing?.role || 'user'),
      };
    }

    db.userAccounts[phone] = {
      appState: appState || db.userAccounts[phone]?.appState || {
        balance: db.users[phone]?.balance ?? 30,
        depositTotal: 0,
        withdrawalTotal: 0,
        commissionTotal: 0,
        sellTotal: 0,
        rewardTotal: 30,
        pendingTotal: 0,
        inProcessAmount: 0,
        inProcessOrders: 0,
        commissionRate: 4.2,
        usdtRate: 112,
        isSellingActive: false,
        integralPoints: 100,
        welcomeBonusAmount: 30,
      },
      orders: orders || db.userAccounts[phone]?.orders || [],
      transactions: transactions || db.userAccounts[phone]?.transactions || [],
      wallets: wallets || db.userAccounts[phone]?.wallets || [],
      activeOrderId: activeOrderId !== undefined ? activeOrderId : db.userAccounts[phone]?.activeOrderId,
      lastSavedAt: new Date().toISOString(),
    };

    saveDb();
    res.json({ success: true, user: db.users[phone], account: db.userAccounts[phone] });
  });

  // 4. Get all pending orders (for Admin Console)
  app.get('/api/orders/pending', (req: Request, res: Response) => {
    res.json({ success: true, pendingOrders: db.pendingOrders });
  });

  // 5. Claim Order (User claims an order over internet)
  app.post('/api/orders/claim', (req: Request, res: Response) => {
    const { order, phone } = req.body;
    if (!order || !phone) {
      return res.status(400).json({ success: false, error: 'Missing order or phone' });
    }

    const user = db.users[phone];
    const claimedOrder: ClaimOrderData = {
      ...order,
      userId: user ? user.id : order.userId,
      userPhone: phone,
      userName: user ? user.name : order.userName,
      claimedAt: new Date().toISOString(),
      status: 'claimed',
      utr: undefined,
    };

    if (db.userAccounts[phone]) {
      db.userAccounts[phone].activeOrderId = order.id;
      const existingIdx = db.userAccounts[phone].orders.findIndex((o) => o.id === order.id);
      if (existingIdx >= 0) {
        db.userAccounts[phone].orders[existingIdx] = claimedOrder;
      } else {
        db.userAccounts[phone].orders.unshift(claimedOrder);
      }
    }

    saveDb();
    res.json({ success: true, order: claimedOrder });
  });

  // 6. Submit UTR (User submits 12-digit payment UTR over internet)
  app.post('/api/orders/submit-utr', (req: Request, res: Response) => {
    const { orderId, utr, phone, payoutWallet } = req.body;
    if (!orderId || !utr || !phone) {
      return res.status(400).json({ success: false, error: 'Missing orderId, utr, or phone' });
    }

    const user = db.users[phone];
    let orderToUpdate: ClaimOrderData | undefined;

    if (db.userAccounts[phone]) {
      const order = db.userAccounts[phone].orders.find((o) => o.id === orderId);
      if (order) {
        order.utr = utr.trim();
        order.status = 'processing';
        order.payoutWallet = payoutWallet || order.payoutWallet;
        orderToUpdate = order;
      }
    }

    if (!orderToUpdate) {
      orderToUpdate = {
        id: orderId,
        currency: 'INR',
        amount: 100,
        income: 4.2,
        category: '100-499',
        status: 'processing',
        utr: utr.trim(),
        userId: user ? user.id : 'User',
        userPhone: phone,
        userName: user ? user.name : 'OK User',
        payoutWallet: payoutWallet || 'Mobikwik',
      };
    }

    // Add or update in server pending queue
    const pIdx = db.pendingOrders.findIndex((o) => o.id === orderId);
    if (pIdx >= 0) {
      db.pendingOrders[pIdx] = orderToUpdate;
    } else {
      db.pendingOrders.unshift(orderToUpdate);
    }

    saveDb();
    res.json({ success: true, order: orderToUpdate });
  });

  // 7. Admin Confirms & Approves Order
  // Requirement 2: User receives FULL buy amount + cashback (e.g. 100 + 3 = 103!)
  app.post('/api/orders/approve', (req: Request, res: Response) => {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    const pendingIdx = db.pendingOrders.findIndex((o) => o.id === orderId);
    let targetOrder = pendingIdx >= 0 ? db.pendingOrders[pendingIdx] : null;

    if (!targetOrder) {
      for (const p of Object.keys(db.userAccounts)) {
        const found = db.userAccounts[p].orders.find((o) => o.id === orderId);
        if (found) {
          targetOrder = found;
          break;
        }
      }
    }

    if (!targetOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const targetPhone = targetOrder.userPhone || '7425831902';
    const totalCredit = targetOrder.amount + targetOrder.income;

    // Remove from pending
    db.pendingOrders = db.pendingOrders.filter((o) => o.id !== orderId);

    // Update user balance & account
    if (db.users[targetPhone]) {
      db.users[targetPhone].balance += totalCredit;
    }

    if (db.userAccounts[targetPhone]) {
      const acc = db.userAccounts[targetPhone];
      acc.appState.balance += totalCredit;
      acc.appState.commissionTotal += targetOrder.income;
      acc.appState.sellTotal += targetOrder.amount;
      acc.appState.rewardTotal += targetOrder.income;
      acc.appState.integralPoints += 10;
      acc.activeOrderId = null;

      const orderInAcc = acc.orders.find((o) => o.id === orderId);
      if (orderInAcc) {
        orderInAcc.status = 'completed';
      }

      acc.transactions.unshift({
        id: `TX-ONLINE-${Date.now()}`,
        type: 'claim_income',
        amount: totalCredit,
        status: 'completed',
        title: `Cloud Admin Approved: ₹${targetOrder.amount} Refund + ₹${targetOrder.income} Cashback (Total ₹${totalCredit})`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Check if this user was referred by someone and check 5-order milestone
      const targetUser = db.users[targetPhone];
      if (targetUser?.referredBy) {
        const inviterPhone = targetUser.referredBy;
        const completedCount = (acc.orders || []).filter((o) => o.status === 'completed').length;
        if (completedCount === 5) {
          db.announcements.unshift({
            id: `msg-ref5-${Date.now()}`,
            title: '🏆 Referral Milestone Unlocked!',
            content: `Your invited friend ${targetUser.name} (${targetUser.phone.slice(0, 4)}****${targetUser.phone.slice(-2)}) has completed 5 orders! Claim an extra ₹500 in Tasks!`,
            date: 'Just now',
            unread: true,
            priority: 'urgent',
            targetPhone: inviterPhone,
          });
          if (db.userAccounts[inviterPhone]) {
            db.userAccounts[inviterPhone].transactions.unshift({
              id: `TX-REF5-${Date.now()}`,
              type: 'referral',
              amount: 500,
              status: 'completed',
              title: `Referral 5 Orders Milestone: ${targetUser.name} (+₹500 Reward Ready)`,
              date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      }
    }

    saveDb();
    res.json({
      success: true,
      creditedAmount: totalCredit,
      targetUser: db.users[targetPhone],
      newBalance: db.users[targetPhone]?.balance,
    });
  });

  // 8. Admin Rejects Order
  app.post('/api/orders/reject', (req: Request, res: Response) => {
    const { orderId } = req.body;
    db.pendingOrders = db.pendingOrders.filter((o) => o.id !== orderId);

    for (const p of Object.keys(db.userAccounts)) {
      const found = db.userAccounts[p].orders.find((o) => o.id === orderId);
      if (found) {
        found.status = 'available';
        found.utr = undefined;
        if (db.userAccounts[p].activeOrderId === orderId) {
          db.userAccounts[p].activeOrderId = null;
        }
      }
    }

    saveDb();
    res.json({ success: true, orderId });
  });

  // 9. User or Admin Cancels Order
  app.post('/api/orders/cancel', (req: Request, res: Response) => {
    const { orderId, phone } = req.body;
    db.pendingOrders = db.pendingOrders.filter((o) => o.id !== orderId);

    if (phone && db.userAccounts[phone]) {
      db.userAccounts[phone].activeOrderId = null;
      const found = db.userAccounts[phone].orders.find((o) => o.id === orderId);
      if (found) {
        found.status = 'available';
        found.utr = undefined;
        found.cancelledAt = new Date().toISOString();
      }
    }

    saveDb();
    res.json({ success: true, orderId });
  });

  // 10. Admin: Adjust Any User Balance over the internet
  app.post('/api/admin/adjust-balance', (req: Request, res: Response) => {
    const { phone, amount, type, reason } = req.body;
    const targetUser = db.users[phone];
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const diff = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);
    targetUser.balance = Math.max(0, targetUser.balance + diff);

    if (db.userAccounts[phone]) {
      const acc = db.userAccounts[phone];
      acc.appState.balance = targetUser.balance;
      if (type === 'credit') {
        acc.appState.depositTotal += Math.abs(amount);
      } else {
        acc.appState.withdrawalTotal += Math.abs(amount);
      }

      acc.transactions.unshift({
        id: `TX-ADMIN-${Date.now()}`,
        type: type === 'credit' ? 'deposit' : 'withdrawal',
        amount: Math.abs(amount),
        status: 'completed',
        title: `Cloud Admin ${type === 'credit' ? 'Credit' : 'Debit'}: ${reason || 'Manual Adjustment'}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    saveDb();
    res.json({ success: true, user: targetUser });
  });

  // 11. Admin: Edit Any User's Credentials
  app.post('/api/admin/edit-credentials', (req: Request, res: Response) => {
    const { phone, name, password, pin } = req.body;
    const targetUser = db.users[phone];
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) targetUser.name = name;
    if (password) targetUser.password = password;
    if (pin) targetUser.pin = pin;

    saveDb();
    res.json({ success: true, user: targetUser });
  });

  // 12. Admin: Toggle User Ban
  app.post('/api/admin/toggle-ban', (req: Request, res: Response) => {
    const { phone } = req.body;
    const targetUser = db.users[phone];
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    targetUser.isBanned = !targetUser.isBanned;
    saveDb();
    res.json({ success: true, user: targetUser });
  });

  // 13. Announcements
  app.get('/api/announcements', (req: Request, res: Response) => {
    reloadDb();
    res.json({ success: true, announcements: db.announcements });
  });

  app.post('/api/announcements', (req: Request, res: Response) => {
    const { title, content, priority } = req.body;
    const newNotice = {
      id: `msg-${Date.now()}`,
      title: title || 'Notice',
      content: content || '',
      date: new Date().toLocaleDateString('en-GB'),
      unread: true,
      priority: priority || 'normal',
    };
    db.announcements.unshift(newNotice);
    saveDb();
    res.json({ success: true, announcement: newNotice });
  });

  // 14. Download Official APK Endpoint (For Android Fans)
  app.get(['/download/okpay.apk', '/download/OKPAY_v2.4_Official.apk', '/api/download-apk'], (req: Request, res: Response) => {
    const apkPath = path.resolve(__dirname, 'public/download/OKPAY_v2.4_Official.apk');
    if (fs.existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="OKPAY_v2.4_Official.apk"');
      return res.sendFile(apkPath);
    }
    return res.status(404).json({ error: 'APK file not found' });
  });

  // Serve public static folder (manifest, icons, service worker)
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Vite Integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`OK PAY Internet Server is running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start OK PAY server:', err);
  process.exit(1);
});
