import { ClaimOrder, User, Transaction, Wallet, AppState } from '../types';

const API_BASE = '/api';

export async function checkServerOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetchAllUsers(): Promise<Record<string, User> | null> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (res.ok) {
      const data = await res.json();
      return data.users || null;
    }
  } catch (err) {
    console.warn('apiFetchAllUsers network error:', err);
  }
  return null;
}

export async function apiFetchUserData(phone: string): Promise<{ user: User; account: any } | null> {
  try {
    const res = await fetch(`${API_BASE}/user/${encodeURIComponent(phone.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { user: data.user, account: data.account };
      }
    }
  } catch (err) {
    console.warn('apiFetchUserData network error:', err);
  }
  return null;
}

export async function apiSyncUserData(
  phone: string,
  payload: {
    user?: User;
    appState?: AppState;
    orders?: ClaimOrder[];
    transactions?: Transaction[];
    wallets?: Wallet[];
    activeOrderId?: string | null;
  }
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/user/${encodeURIComponent(phone.trim())}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiSyncUserData network error:', err);
    return false;
  }
}

export async function apiRegisterUser(params: {
  phone: string;
  name: string;
  password?: string;
  inviteCode?: string;
}): Promise<{ user: User; account: any } | null> {
  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return { user: data.user, account: data.account };
    }
  } catch (err) {
    console.warn('apiRegisterUser network error:', err);
  }
  return null;
}

export async function apiLoginUser(params: {
  phone: string;
  password?: string;
}): Promise<{ success: boolean; user?: User; account?: any; isNewUser?: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('apiLoginUser network error:', err);
    return { success: false, error: 'Network error connecting to cloud server' };
  }
}


export async function apiFetchPendingOrders(): Promise<ClaimOrder[] | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/pending`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.pendingOrders)) {
        return data.pendingOrders;
      }
    }
  } catch (err) {
    console.warn('apiFetchPendingOrders network error:', err);
  }
  return null;
}

export async function apiClaimOrder(order: ClaimOrder, phone: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/orders/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, phone }),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiClaimOrder network error:', err);
    return false;
  }
}

export async function apiSubmitUtr(params: {
  orderId: string;
  utr: string;
  phone: string;
  payoutWallet?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/orders/submit-utr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiSubmitUtr network error:', err);
    return false;
  }
}

export async function apiApproveOrder(orderId: string): Promise<{ success: boolean; creditedAmount?: number; newBalance?: number }> {
  try {
    const res = await fetch(`${API_BASE}/orders/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('apiApproveOrder network error:', err);
  }
  return { success: false };
}

export async function apiRejectOrder(orderId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/orders/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiRejectOrder network error:', err);
    return false;
  }
}

export async function apiCancelOrder(orderId: string, phone: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/orders/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, phone }),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiCancelOrder network error:', err);
    return false;
  }
}

export async function apiAdminAdjustBalance(params: {
  phone: string;
  amount: number;
  type: 'credit' | 'debit';
  reason?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/adjust-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiAdminAdjustBalance network error:', err);
    return false;
  }
}

export async function apiAdminEditCredentials(params: {
  phone: string;
  name?: string;
  password?: string;
  pin?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/edit-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiAdminEditCredentials network error:', err);
    return false;
  }
}

export async function apiAdminToggleBan(phone: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/toggle-ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiAdminToggleBan network error:', err);
    return false;
  }
}

export async function apiFetchAnnouncements(): Promise<import('../types').Announcement[] | null> {
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        return data.announcements;
      }
    }
  } catch (err) {
    console.warn('apiFetchAnnouncements network error:', err);
  }
  return null;
}

