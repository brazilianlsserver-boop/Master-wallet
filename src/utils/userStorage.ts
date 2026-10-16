import { AppState, ClaimOrder, Transaction, User, Wallet } from '../types';
import { initialOrders, initialWallets } from '../data/mockData';
import { apiSyncUserData, apiSubmitUtr, apiCancelOrder } from './api';

export interface UserAccountData {
  user: User;
  appState: AppState;
  orders: ClaimOrder[];
  transactions: Transaction[];
  wallets: Wallet[];
  activeOrderId?: string | null;
  claimedTaskIds?: string[];
  lastSavedAt: string;
}

const STORAGE_USERS_DIRECTORY_KEY = 'okpay_users_directory_v2';
const STORAGE_CURRENT_PHONE_KEY = 'okpay_current_phone_v2';
const STORAGE_USERDATA_PREFIX = 'okpay_userdata_v2_';

// Default Accounts
export const DEFAULT_USERS_DATA: Record<string, UserAccountData> = {
  '7425831902': {
    user: {
      phone: '7425831902',
      id: '316568',
      name: 'OK User',
      password: 'password123',
      isLoggedIn: true,
      pin: '123456',
      inviteCode: '894215',
      role: 'user',
      createdAt: '2026-10-10',
      balance: 100,
    },
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
    orders: initialOrders,
    transactions: [
      {
        id: 'TX-INIT-BONUS',
        type: 'claim_income',
        amount: 30,
        status: 'completed',
        title: 'New User Login Reward (+₹30)',
        date: '10:00 AM',
      },
      {
        id: 'TX-INIT-COMMISSION',
        type: 'claim_income',
        amount: 70,
        status: 'completed',
        title: 'Initial Cashback Rebate (+₹70)',
        date: '10:15 AM',
      },
    ],
    wallets: initialWallets,
    lastSavedAt: new Date().toISOString(),
  },
  '8949263502': {
    user: {
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
    appState: {
      balance: 50000,
      depositTotal: 100000,
      withdrawalTotal: 50000,
      commissionTotal: 15400,
      sellTotal: 350000,
      rewardTotal: 5000,
      pendingTotal: 0,
      inProcessAmount: 0,
      inProcessOrders: 0,
      commissionRate: 4.2,
      usdtRate: 112,
      isSellingActive: false,
      integralPoints: 500,
      welcomeBonusAmount: 30,
    },
    orders: initialOrders,
    transactions: [],
    wallets: initialWallets,
    lastSavedAt: new Date().toISOString(),
  },
};

/**
 * Generate a unique 6-digit User ID that doesn't conflict with existing IDs
 */
export function generateUniqueUserId(existingUsers: Record<string, User>): string {
  const existingIds = new Set(Object.values(existingUsers).map((u) => u.id));
  let attempts = 0;
  while (attempts < 1000) {
    const candidate = Math.floor(100000 + Math.random() * 900000).toString();
    if (!existingIds.has(candidate)) {
      return candidate;
    }
    attempts++;
  }
  return `${Date.now()}`.slice(-6);
}

/**
 * Read all registered users from device storage
 */
export function getStoredUsersDirectory(): Record<string, User> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_DIRECTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          '7425831902': DEFAULT_USERS_DATA['7425831902'].user,
          '8949263502': DEFAULT_USERS_DATA['8949263502'].user,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.error('Failed to read users directory from storage', err);
  }

  // Fallback defaults
  const defaults: Record<string, User> = {
    '7425831902': DEFAULT_USERS_DATA['7425831902'].user,
    '8949263502': DEFAULT_USERS_DATA['8949263502'].user,
  };
  saveStoredUsersDirectory(defaults);
  return defaults;
}

/**
 * Persist users directory to device storage
 */
export function saveStoredUsersDirectory(users: Record<string, User>): void {
  try {
    localStorage.setItem(STORAGE_USERS_DIRECTORY_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users directory to storage', err);
  }
}

/**
 * Get active user phone saved on device (survives app close & phone restart)
 */
export function getStoredActivePhone(): string {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENT_PHONE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (err) {
    console.error('Failed to read active phone', err);
  }
  return '';
}

/**
 * Save active user phone to device storage
 */
export function saveStoredActivePhone(phone: string): void {
  try {
    localStorage.setItem(STORAGE_CURRENT_PHONE_KEY, phone.trim());
  } catch (err) {
    console.error('Failed to save active phone', err);
  }
}

export function sanitizeAppState(raw: Partial<AppState> | undefined | null): AppState {
  return {
    balance: typeof raw?.balance === 'number' && !isNaN(raw.balance) ? raw.balance : 30,
    depositTotal: typeof raw?.depositTotal === 'number' && !isNaN(raw.depositTotal) ? raw.depositTotal : 0,
    withdrawalTotal: typeof raw?.withdrawalTotal === 'number' && !isNaN(raw.withdrawalTotal) ? raw.withdrawalTotal : 0,
    commissionTotal: typeof raw?.commissionTotal === 'number' && !isNaN(raw.commissionTotal) ? raw.commissionTotal : 0,
    sellTotal: typeof raw?.sellTotal === 'number' && !isNaN(raw.sellTotal) ? raw.sellTotal : 0,
    rewardTotal: typeof raw?.rewardTotal === 'number' && !isNaN(raw.rewardTotal) ? raw.rewardTotal : 30,
    pendingTotal: typeof raw?.pendingTotal === 'number' && !isNaN(raw.pendingTotal) ? raw.pendingTotal : 0,
    inProcessAmount: typeof raw?.inProcessAmount === 'number' && !isNaN(raw.inProcessAmount) ? raw.inProcessAmount : 0,
    inProcessOrders: typeof raw?.inProcessOrders === 'number' && !isNaN(raw.inProcessOrders) ? raw.inProcessOrders : 0,
    commissionRate: typeof raw?.commissionRate === 'number' && !isNaN(raw.commissionRate) ? raw.commissionRate : 4.2,
    usdtRate: typeof raw?.usdtRate === 'number' && !isNaN(raw.usdtRate) ? raw.usdtRate : 112,
    isSellingActive: Boolean(raw?.isSellingActive),
    integralPoints: typeof raw?.integralPoints === 'number' && !isNaN(raw.integralPoints) ? raw.integralPoints : 100,
    welcomeBonusAmount: typeof raw?.welcomeBonusAmount === 'number' && !isNaN(raw.welcomeBonusAmount) ? raw.welcomeBonusAmount : 30,
  };
}

/**
 * Get full data for a specific user phone from device storage
 */
export function getUserAccountData(phone?: string, allUsers?: Record<string, User>): UserAccountData {
  const trimmed = (phone || '7425831902').trim();
  const storageKey = `${STORAGE_USERDATA_PREFIX}${trimmed}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: Partial<UserAccountData> = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const cleanAppState = sanitizeAppState(parsed.appState);
        const usersDir = allUsers || getStoredUsersDirectory();
        const existingDirUser = usersDir[trimmed];

        // STRICT RULE: Once an ID is assigned, NEVER change it! "ak bar jo id ban gai so ban gai"
        const permanentId = existingDirUser?.id || parsed.user?.id || generateUniqueUserId(usersDir);

        const cleanUser: User = {
          phone: trimmed,
          id: permanentId,
          name: parsed.user?.name || existingDirUser?.name || `OK User ${trimmed.slice(-4)}`,
          password: parsed.user?.password || existingDirUser?.password || 'password123',
          pin: parsed.user?.pin || existingDirUser?.pin || '123456',
          inviteCode: parsed.user?.inviteCode || existingDirUser?.inviteCode || '894215',
          role: trimmed === '8949263502' ? 'admin' : (parsed.user?.role || existingDirUser?.role || 'user'),
          isLoggedIn: parsed.user?.isLoggedIn ?? false,
          createdAt: parsed.user?.createdAt || existingDirUser?.createdAt || '2026-10-10',
          balance: cleanAppState.balance,
        };

        const cleanOrders = Array.isArray(parsed.orders) && parsed.orders.length > 0
          ? parsed.orders
          : initialOrders;

        const cleanWallets = Array.isArray(parsed.wallets) && parsed.wallets.length > 0
          ? parsed.wallets
          : initialWallets;

        const cleanTransactions = Array.isArray(parsed.transactions)
          ? parsed.transactions
          : [];

        return {
          user: cleanUser,
          appState: cleanAppState,
          orders: cleanOrders,
          transactions: cleanTransactions,
          wallets: cleanWallets,
          activeOrderId: parsed.activeOrderId || null,
          claimedTaskIds: Array.isArray(parsed.claimedTaskIds) ? parsed.claimedTaskIds : [],
          lastSavedAt: parsed.lastSavedAt || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.error(`Failed to read user data for ${trimmed}`, err);
  }

  // Check if default exists
  if (DEFAULT_USERS_DATA[trimmed]) {
    const def = JSON.parse(JSON.stringify(DEFAULT_USERS_DATA[trimmed]));
    def.appState = sanitizeAppState(def.appState);
    return def;
  }

  // Otherwise synthesize new user data without corrupting cloud
  const usersDir = allUsers || getStoredUsersDirectory();
  const existingUser = usersDir[trimmed];
  const userId = existingUser?.id || generateUniqueUserId(usersDir);

  const newUser: User = existingUser
    ? { ...existingUser }
    : {
        phone: trimmed,
        id: userId,
        name: `OK User ${trimmed.slice(-4)}`,
        password: 'password123',
        pin: '123456',
        inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
        role: trimmed === '8949263502' ? 'admin' : 'user',
        isLoggedIn: false,
        createdAt: new Date().toISOString().split('T')[0],
        balance: 30,
      };

  const newAccountData: UserAccountData = {
    user: newUser,
    appState: {
      balance: existingUser?.balance ?? 30,
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
    orders: initialOrders,
    transactions: [
      {
        id: `TX-BONUS-${Date.now()}`,
        type: 'claim_income',
        amount: 30,
        status: 'completed',
        title: 'New Account Welcome Bonus (+₹30)',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    wallets: initialWallets,
    lastSavedAt: new Date().toISOString(),
  };

  return newAccountData;
}

/**
 * Continuously save a user's full data to device storage
 */
export function saveUserAccountData(phone: string, data: UserAccountData, syncToCloud = true): void {
  const trimmed = phone.trim();
  const storageKey = `${STORAGE_USERDATA_PREFIX}${trimmed}`;

  try {
    data.appState = sanitizeAppState(data.appState);
    data.user.balance = data.appState.balance;
    data.lastSavedAt = new Date().toISOString();

    localStorage.setItem(storageKey, JSON.stringify(data));

    // Also update directory while strictly locking permanent ID
    const dir = getStoredUsersDirectory();
    if (dir[trimmed]?.id) {
      data.user.id = dir[trimmed].id;
    }
    dir[trimmed] = { ...data.user, balance: data.appState.balance };
    saveStoredUsersDirectory(dir);

    // Sync to cloud server over internet (fire and forget)
    if (syncToCloud) {
      apiSyncUserData(trimmed, data).catch(() => {});
    }
  } catch (err) {
    console.error(`Failed to save user account data for ${trimmed}`, err);
  }
}

/**
 * Persist or clear active in-progress order ID for a user
 */
export function saveUserActiveOrderId(phone: string, orderId: string | null): void {
  try {
    const data = getUserAccountData(phone);
    data.activeOrderId = orderId;
    saveUserAccountData(phone, data);
  } catch (err) {
    console.error(`Failed to save active order ID for ${phone}`, err);
  }
}

/**
 * Get active in-progress order ID for a user
 */
export function getUserActiveOrderId(phone: string): string | null {
  try {
    const data = getUserAccountData(phone);
    return data.activeOrderId || null;
  } catch {
    return null;
  }
}

const STORAGE_GLOBAL_PENDING_ORDERS_KEY = 'okpay_global_pending_orders_v2';

/**
 * Get all global pending UTR / processing orders
 */
export function getGlobalPendingOrders(): ClaimOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_GLOBAL_PENDING_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (o) => o && o.status !== 'completed' && o.status !== 'cancelled'
        );
      }
    }
  } catch (err) {
    console.error('Failed to read global pending orders', err);
  }
  return [];
}

/**
 * Add or update a pending order in global pending queue
 */
export function saveGlobalPendingOrder(order: ClaimOrder): void {
  try {
    const list = getGlobalPendingOrders();
    const existingIndex = list.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      list[existingIndex] = order;
    } else {
      list.unshift(order);
    }
    localStorage.setItem(STORAGE_GLOBAL_PENDING_ORDERS_KEY, JSON.stringify(list));

    if (order.utr && order.userPhone) {
      apiSubmitUtr({
        orderId: order.id,
        utr: order.utr,
        phone: order.userPhone,
        payoutWallet: order.payoutWallet,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to save global pending order', err);
  }
}

/**
 * Remove an order from global pending queue (when approved or cancelled)
 */
export function removeGlobalPendingOrder(orderId: string): void {
  try {
    const list = getGlobalPendingOrders();
    const target = list.find((o) => o.id === orderId);
    const updated = list.filter((o) => o.id !== orderId);
    localStorage.setItem(STORAGE_GLOBAL_PENDING_ORDERS_KEY, JSON.stringify(updated));

    if (target?.userPhone) {
      apiCancelOrder(orderId, target.userPhone).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to remove global pending order', err);
  }
}

/**
 * Aggregate all pending orders waiting for Admin confirmation across ALL registered users
 * Ensures Admin Panel sees EVERY user's order approval request immediately!
 */
export function getAllPendingOrdersAcrossUsers(): ClaimOrder[] {
  const pendingMap = new Map<string, ClaimOrder>();

  // 1. From global pending queue
  const globalQueue = getGlobalPendingOrders();
  for (const o of globalQueue) {
    if (
      o.status === 'processing' ||
      (o.utr && o.status !== 'completed' && o.status !== 'cancelled')
    ) {
      pendingMap.set(o.id, o);
    }
  }

  // 2. Scan all registered users in device storage
  try {
    const usersDir = getStoredUsersDirectory();
    for (const phone of Object.keys(usersDir)) {
      const accountData = getUserAccountData(phone);
      if (accountData && accountData.orders) {
        for (const o of accountData.orders) {
          if (
            (o.status === 'processing' || Boolean(o.utr)) &&
            o.status !== 'completed' &&
            o.status !== 'cancelled'
          ) {
            const withUserData: ClaimOrder = {
              ...o,
              userId: o.userId || accountData.user.id,
              userPhone: o.userPhone || accountData.user.phone,
              userName: o.userName || accountData.user.name,
            };
            pendingMap.set(o.id, withUserData);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error scanning users for pending orders', err);
  }

  return Array.from(pendingMap.values());
}

