import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  Coins,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Megaphone,
  Sliders,
  ArrowRightLeft,
  RefreshCw,
  Wallet,
  Key,
  Search,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  Power,
  Clock,
  Copy,
} from 'lucide-react';
import { AppState, ClaimOrder, Transaction, User, Announcement } from '../../types';
import { sounds } from '../../utils/audio';
import {
  getUserAccountData,
  saveUserAccountData,
  getStoredUsersDirectory,
  saveStoredUsersDirectory,
  generateUniqueUserId,
  getAllPendingOrdersAcrossUsers,
  removeGlobalPendingOrder,
  saveGlobalPendingOrder,
} from '../../utils/userStorage';
import {
  apiFetchAllUsers,
  apiFetchPendingOrders,
  apiApproveOrder,
  apiRejectOrder,
  apiAdminAdjustBalance,
  apiAdminEditCredentials,
  apiAdminToggleBan,
  apiRegisterUser,
} from '../../utils/api';


interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  registeredUsers: Record<string, User>;
  setRegisteredUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  orders: ClaimOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ClaimOrder[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  showToast: (msg: string) => void;
  onSwitchUser?: (targetUser: User) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
  appState,
  setAppState,
  registeredUsers,
  setRegisteredUsers,
  orders,
  setOrders,
  transactions,
  setTransactions,
  announcements,
  setAnnouncements,
  showToast,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users' | 'transactions' | 'orders' | 'config'>('approvals');

  // Search in user list
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // User balance adjuster state
  const [selectedUserPhone, setSelectedUserPhone] = useState<string>(user.phone || '7425831902');
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>('Manual Admin Adjustment');

  // Add User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserInitialBalance, setNewUserInitialBalance] = useState(100);

  // Edit User Credentials State
  const [editingUserPhone, setEditingUserPhone] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPass, setEditUserPass] = useState('');
  const [editUserPin, setEditUserPin] = useState('');

  // Transaction filter
  const [txFilter, setTxFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'claims'>('all');

  // New Order Form state
  const [newOrderAmount, setNewOrderAmount] = useState<number>(5000);
  const [newOrderIncome, setNewOrderIncome] = useState<number>(210);
  const [newOrderCategory, setNewOrderCategory] = useState<string>('5000+');
  const [newOrderCurrency, setNewOrderCurrency] = useState<'INR' | 'USDT'>('INR');

  // Rate config form state
  const [editRate, setEditRate] = useState<number>(appState?.commissionRate ?? 4.2);
  const [editUsdtRate, setEditUsdtRate] = useState<number>(appState?.usdtRate ?? 112);
  const [editBonusAmount, setEditBonusAmount] = useState<number>(appState?.welcomeBonusAmount ?? 30);

  // Broadcast message form state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'urgent'>('normal');

  // Pending UTR Orders waiting for Admin Confirmation (scans all users & global queue)
  const [allPendingOrders, setAllPendingOrders] = useState<ClaimOrder[]>(() => {
    return getAllPendingOrdersAcrossUsers();
  });

  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  const handleManualSyncUsers = async () => {
    setIsSyncingUsers(true);
    sounds.playTap();
    try {
      const [cloudUsers, cloudOrders] = await Promise.all([
        apiFetchAllUsers(),
        apiFetchPendingOrders(),
      ]);
      if (cloudUsers && Object.keys(cloudUsers).length > 0) {
        setRegisteredUsers((prev) => {
          const merged = { ...getStoredUsersDirectory(), ...prev, ...cloudUsers };
          saveStoredUsersDirectory(merged);
          return merged;
        });
        showToast(`Synced ${Object.keys(cloudUsers).length} users live from Cloud Server!`);
      }
      if (cloudOrders) {
        setAllPendingOrders(cloudOrders);
      }
    } catch {
      showToast('Cloud server sync completed');
    } finally {
      setIsSyncingUsers(false);
    }
  };

  // Re-fetch pending orders & users from Cloud Server on modal open, tab change, and on real-time 2.0s interval
  React.useEffect(() => {
    if (isOpen) {
      const syncCloudData = async () => {
        try {
          const [cloudUsers, cloudOrders] = await Promise.all([
            apiFetchAllUsers(),
            apiFetchPendingOrders(),
          ]);

          if (cloudUsers && Object.keys(cloudUsers).length > 0) {
            setRegisteredUsers((prev) => {
              const merged = { ...getStoredUsersDirectory(), ...prev, ...cloudUsers };
              saveStoredUsersDirectory(merged);
              return merged;
            });
          }

          if (cloudOrders) {
            setAllPendingOrders(cloudOrders);
          } else {
            setAllPendingOrders(getAllPendingOrdersAcrossUsers());
          }
        } catch {
          setAllPendingOrders(getAllPendingOrdersAcrossUsers());
        }
      };

      syncCloudData();
      const interval = setInterval(syncCloudData, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab, orders]);

  if (!isOpen) return null;

  const usersList = Object.values(registeredUsers || {});
  const filteredUsers = usersList.filter(
    (u) =>
      (u?.phone && u.phone.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u?.name && u.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u?.id && u.id.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  // Handler: Add New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = newUserPhone.trim();
    if (!phone) {
      showToast('Phone number required');
      return;
    }
    if (registeredUsers[phone]) {
      showToast('User with this phone already exists');
      return;
    }

    sounds.playTap();
    const newId = generateUniqueUserId(registeredUsers);
    const createdUser: User = {
      phone,
      id: newId,
      name: newUserName.trim() || `User_${phone.slice(-4)}`,
      password: newUserPassword || 'password123',
      pin: '123456',
      inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
      isLoggedIn: false,
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0],
      balance: newUserInitialBalance,
    };

    const targetAccount = getUserAccountData(phone);
    targetAccount.user = createdUser;
    targetAccount.appState.balance = newUserInitialBalance;
    targetAccount.user.balance = newUserInitialBalance;

    if (newUserInitialBalance > 0) {
      const initialTx: Transaction = {
        id: `TX-INIT-${Date.now()}`,
        type: 'deposit',
        amount: newUserInitialBalance,
        status: 'completed',
        title: `Admin Initial Balance Credit`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      targetAccount.transactions.unshift(initialTx);
      if (user.phone === phone) {
        setTransactions((prev) => [initialTx, ...prev]);
      }
    }

    saveUserAccountData(phone, targetAccount);
    setRegisteredUsers(getStoredUsersDirectory());

    // Also register on Cloud Server so visible on all phones
    apiRegisterUser({
      phone,
      name: newUserName.trim() || `User_${phone.slice(-4)}`,
      password: newUserPassword || 'password123',
    }).catch(() => {});

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserPhone('');
    showToast(`User ${phone} (ID: ${newId}) created & saved across cloud server!`);
  };

  // Handler: Adjust User Balance (Saved to device storage & cloud server)
  const handleAdjustBalance = (type: 'credit' | 'debit') => {
    sounds.playTap();
    const targetUser = registeredUsers[selectedUserPhone];
    if (!targetUser) return;

    const diff = type === 'credit' ? adjustAmount : -adjustAmount;

    // Load and update target user's persistent record
    const targetAccount = getUserAccountData(selectedUserPhone);
    targetAccount.appState.balance = Math.max(0, targetAccount.appState.balance + diff);
    targetAccount.user.balance = targetAccount.appState.balance;
    if (type === 'credit') {
      targetAccount.appState.depositTotal += adjustAmount;
    } else {
      targetAccount.appState.withdrawalTotal += adjustAmount;
    }

    const newTx: Transaction = {
      id: `TX-ADMIN-${Date.now()}`,
      type: type === 'credit' ? 'deposit' : 'withdrawal',
      amount: adjustAmount,
      status: 'completed',
      title: `${type === 'credit' ? 'Admin Balance Credit' : 'Admin Balance Debit'}: ${adjustReason}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    targetAccount.transactions.unshift(newTx);
    saveUserAccountData(selectedUserPhone, targetAccount);
    setRegisteredUsers(getStoredUsersDirectory());

    // Also sync adjustment with Cloud Server over internet
    apiAdminAdjustBalance({
      phone: selectedUserPhone,
      amount: adjustAmount,
      type,
      reason: adjustReason,
    }).catch(() => {});

    // If currently logged-in user, update live state too
    if (user.phone === selectedUserPhone) {
      setAppState(targetAccount.appState);
      setTransactions((prev) => [newTx, ...prev]);
      setUser((prev) => ({ ...prev, balance: targetAccount.appState.balance }));
    }

    showToast(
      `${type === 'credit' ? 'Credited' : 'Debited'} ₹${adjustAmount} to ${selectedUserPhone} (ID: ${targetUser.id})`
    );
  };

  // Handler: Toggle Ban / Status
  const handleToggleUserBan = (phone: string) => {
    sounds.playTap();
    apiAdminToggleBan(phone).catch(() => {});
    setRegisteredUsers((prev) => {
      const current = prev[phone];
      if (!current) return prev;
      const updated = {
        ...prev,
        [phone]: { ...current, isBanned: !current.isBanned },
      };
      saveStoredUsersDirectory(updated);
      return updated;
    });
    showToast(`User ${phone} status updated`);
  };

  // Handler: Save User Credentials Edit
  const handleSaveUserEdit = (phone: string) => {
    sounds.playTap();
    apiAdminEditCredentials({
      phone,
      name: editUserName || undefined,
      password: editUserPass || undefined,
      pin: editUserPin || undefined,
    }).catch(() => {});

    setRegisteredUsers((prev) => {
      const current = prev[phone];
      if (!current) return prev;
      const updatedUser: User = {
        ...current,
        name: editUserName || current.name,
        password: editUserPass || current.password,
        pin: editUserPin || current.pin,
      };
      const updated = {
        ...prev,
        [phone]: updatedUser,
      };
      saveStoredUsersDirectory(updated);

      // If active user, update active user state too
      if (user.phone === phone) {
        setUser(updatedUser);
      }
      return updated;
    });
    setEditingUserPhone(null);
    showToast(`Account credentials for ${phone} saved`);
  };

  // Handler: Switch user (Login as this user)
  const handleSwitchUser = (targetUser: User) => {
    sounds.playTap();
    if (onSwitchUser) {
      onSwitchUser(targetUser);
    } else {
      setUser({ ...targetUser, isLoggedIn: true });
    }
    showToast(`Switched session to ${targetUser.phone}`);
    onClose();
  };

  // Handler: Add New Claim Order to Pool
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderAmount <= 0) return;

    sounds.playTap();
    const newOrder: ClaimOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      currency: newOrderCurrency,
      amount: newOrderAmount,
      income: newOrderIncome,
      category: newOrderCategory as ClaimOrder['category'],
      status: 'available',
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} (₹${newOrder.amount}) added to pool`);
  };

  // Handler: Generate Batch Preset Orders
  const handleGenerateBatchOrders = () => {
    sounds.playTap();
    const batch: ClaimOrder[] = [
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 500,
        income: 21,
        category: '500-1999',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 2500,
        income: 105,
        category: '2000-4999',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 6000,
        income: 252,
        category: '5000+',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 12000,
        income: 504,
        category: '5000+',
        status: 'available',
      },
    ];
    setOrders((prev) => [...batch, ...prev]);
    showToast('Generated 4 fresh merchant orders in pool!');
  };

  // Handler: Delete or Toggle Order
  const handleDeleteOrder = (orderId: string) => {
    sounds.playTap();
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('Order removed from pool');
  };

  // Pending UTR Orders waiting for Admin Confirmation (scans all users & global queue)
  const pendingUtrOrders = allPendingOrders;

  // Handler: Confirm & Approve Order UTR (Releases cashback to user balance)
  const handleApproveOrderUtr = async (orderId: string) => {
    const targetOrder =
      allPendingOrders.find((o) => o.id === orderId) ||
      orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    sounds.playCoinChime();

    // 1. Mark order as completed
    const updatedOrder: ClaimOrder = { ...targetOrder, status: 'completed' };

    // 2. Remove from global pending queue
    removeGlobalPendingOrder(orderId);

    // Call Cloud Server so remote user gets credited over the internet!
    // Server adds full buy amount + cashback: (e.g. 100 buy + 3 cashback = 103 total credited)
    try {
      await apiApproveOrder(orderId);
    } catch (e) {
      console.warn('apiApproveOrder error:', e);
    }

    // 3. Update orders in live state if present
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    // 4. Identify target user from order (userPhone or userId)
    let targetPhone = targetOrder.userPhone;
    if (!targetPhone && targetOrder.userId) {
      const usersDir = getStoredUsersDirectory();
      const match = Object.values(usersDir).find((u) => u.id === targetOrder.userId);
      if (match) targetPhone = match.phone;
    }
    if (!targetPhone) {
      targetPhone = user.role === 'admin' ? '7425831902' : user.phone;
    }

    const targetAccount = getUserAccountData(targetPhone);

    // 2nd Requirement: User receives full purchase amount + cashback (e.g. 100 buy + 3 cashback = 103 total)
    const totalCredit = targetOrder.amount + targetOrder.income;
    targetAccount.appState.balance += totalCredit;
    targetAccount.appState.commissionTotal += targetOrder.income;
    targetAccount.appState.rewardTotal += targetOrder.income;
    targetAccount.appState.sellTotal += targetOrder.amount;
    targetAccount.appState.integralPoints += 10;
    targetAccount.user.balance = targetAccount.appState.balance;

    // Update order in target user's records & clear active order
    targetAccount.orders = targetAccount.orders.map((o) =>
      o.id === orderId ? updatedOrder : o
    );
    if (targetAccount.activeOrderId === orderId) {
      targetAccount.activeOrderId = null;
    }

    // 5. Record transaction for target user
    const newTx: Transaction = {
      id: `TX-UTR-${Date.now()}`,
      type: 'claim_income',
      amount: totalCredit,
      status: 'completed',
      title: `Admin Approved: ₹${targetOrder.amount} Refund + ₹${targetOrder.income} Cashback (Total ₹${totalCredit})`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    targetAccount.transactions.unshift(newTx);

    // Save to persistent device storage
    saveUserAccountData(targetPhone, targetAccount);
    setRegisteredUsers(getStoredUsersDirectory());

    // Dispatch instant notification event for target user
    window.dispatchEvent(
      new CustomEvent('okpay_order_approved', {
        detail: { order: updatedOrder, phone: targetPhone },
      })
    );

    // Refresh pending orders list immediately from server
    try {
      const refreshedPending = await apiFetchPendingOrders();
      if (refreshedPending) {
        setAllPendingOrders(refreshedPending);
      } else {
        setAllPendingOrders(getAllPendingOrdersAcrossUsers());
      }
    } catch {
      setAllPendingOrders(getAllPendingOrdersAcrossUsers());
    }

    // If currently logged-in user is target user, update live states
    if (user.phone === targetPhone) {
      setAppState(targetAccount.appState);
      setTransactions((prev) => [newTx, ...prev]);
      setUser((prev) => ({ ...prev, balance: targetAccount.appState.balance }));
    }

    showToast(
      `Order ${orderId} confirmed! ₹${targetOrder.amount} Refund + ₹${targetOrder.income} Cashback (Total ₹${totalCredit}) credited to ${targetAccount.user.name} (ID: ${targetAccount.user.id})!`
    );
  };

  // Handler: Reject Order UTR
  const handleRejectOrderUtr = async (orderId: string) => {
    sounds.playTap();
    removeGlobalPendingOrder(orderId);

    try {
      await apiRejectOrder(orderId);
    } catch (e) {
      console.warn('apiRejectOrder error:', e);
    }

    // Find target order and reset in target user account
    const targetOrder =
      allPendingOrders.find((o) => o.id === orderId) ||
      orders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.userPhone) {
      const targetAccount = getUserAccountData(targetOrder.userPhone);
      targetAccount.orders = targetAccount.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'available', utr: undefined } : o
      );
      if (targetAccount.activeOrderId === orderId) {
        targetAccount.activeOrderId = null;
      }
      saveUserAccountData(targetOrder.userPhone, targetAccount);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'available', utr: undefined } : o
      )
    );

    try {
      const refreshedPending = await apiFetchPendingOrders();
      if (refreshedPending) {
        setAllPendingOrders(refreshedPending);
      } else {
        setAllPendingOrders(getAllPendingOrdersAcrossUsers());
      }
    } catch {
      setAllPendingOrders(getAllPendingOrdersAcrossUsers());
    }

    showToast(`Order ${orderId} rejected & restored to available pool.`);
  };

  const handleResetOrderStatus = (orderId: string) => {
    sounds.playTap();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'available' } : o))
    );
    showToast(`Order ${orderId} marked available`);
  };

  // Handler: Update Transaction Status (Approve / Reject)
  const handleUpdateTxStatus = (txId: string, newStatus: 'completed' | 'failed') => {
    sounds.playTap();
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: newStatus } : t))
    );
    showToast(`Transaction marked as ${newStatus}`);
  };

  // Handler: Update Rates
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setAppState((prev) => ({
      ...prev,
      commissionRate: editRate,
      usdtRate: editUsdtRate,
      welcomeBonusAmount: editBonusAmount,
    }));
    showToast(`Config saved: Cashback ${editRate}%, USDT ₹${editUsdtRate}`);
  };

  // Handler: Broadcast Announcement
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;
    sounds.playTap();

    const newNotice: Announcement = {
      id: `msg-${Date.now()}`,
      title: announcementTitle.trim(),
      content: announcementBody.trim() || 'Official update from OK PAY System Administration.',
      date: 'Just Now',
      unread: true,
      priority: announcementPriority,
    };

    setAnnouncements((prev) => [newNotice, ...prev]);
    showToast(`Broadcasted: "${announcementTitle}" to all users`);
    setAnnouncementTitle('');
    setAnnouncementBody('');
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'deposits') return tx.type === 'deposit';
    if (txFilter === 'withdrawals') return tx.type === 'withdrawal';
    if (txFilter === 'claims') return tx.type === 'claim_income' || tx.type === 'commission';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg h-[92vh] bg-gray-950 text-gray-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-gray-950 px-4 py-3.5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0FA968] to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-white tracking-wide">
                  OK PAY Master Console
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Full platform control, user accounts, liquidity & orders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Pill Bar */}
        <div className="flex bg-gray-900/90 p-1.5 border-b border-gray-800 space-x-1 shrink-0 overflow-x-auto no-scrollbar">
          {[
            {
              id: 'approvals',
              label: `⚡ UTR Approvals ${pendingUtrOrders.length > 0 ? `(${pendingUtrOrders.length})` : ''}`,
              hasBadge: pendingUtrOrders.length > 0,
            },
            { id: 'overview', label: '📊 Dashboard' },
            { id: 'users', label: `👥 Users (${usersList.length})` },
            { id: 'transactions', label: `💰 Tx History (${transactions.length})` },
            { id: 'orders', label: `📦 Orders (${orders.length})` },
            { id: 'config', label: '⚙️ Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#0FA968] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.hasBadge && activeTab !== tab.id && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB: UTR APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-[#0FA968]" />
                    <span>Order UTR Verification &amp; Cashback Claim</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    User cashback is pending. Click &quot;Confirm &amp; Approve&quot; to credit their balance.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  {pendingUtrOrders.length} Pending
                </span>
              </div>

              {pendingUtrOrders.length === 0 ? (
                <div className="p-8 text-center bg-gray-900/60 rounded-2xl border border-gray-800 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                  <div className="text-xs font-bold text-gray-200">No Pending UTR Submissions</div>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    All submitted orders have been reviewed. When a user submits their 12-digit payment UTR, it will appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUtrOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-900/95 p-4 rounded-2xl border border-amber-500/40 shadow-xl space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-white">{order.id}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-0.5" />
                              <span>UTR Submitted</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-300 font-medium mt-1">
                            User: <strong className="text-white">{order.userName || registeredUsers[order.userPhone || '']?.name || 'OK User'}</strong> (ID: <span className="text-amber-400 font-mono font-bold">{order.userId || registeredUsers[order.userPhone || '']?.id || '316568'}</span> • {order.userPhone || '7425831902'})
                          </div>
                          <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                            Principal: <strong className="text-white">₹{order.amount.toLocaleString()}</strong> • Cashback Rebate:{' '}
                            <strong className="text-emerald-400 font-bold">+₹{order.income}</strong>
                          </div>
                        </div>

                        <span className="text-xs font-black text-[#FFC727] bg-[#111827] px-2 py-1 rounded-lg border border-amber-500/30">
                          FamPay QR
                        </span>
                      </div>

                      {/* UTR Box with Copy */}
                      <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Submitted Payment UTR</span>
                          <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                            {order.utr || 'Pending Entry'}
                          </span>
                        </div>
                        {order.utr && (
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playTap();
                              navigator.clipboard.writeText(order.utr || '');
                              showToast(`Copied UTR: ${order.utr}`);
                            }}
                            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-750 text-gray-200 text-xs font-bold rounded-lg cursor-pointer border border-gray-700 flex items-center space-x-1"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copy UTR</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>
                          Target Wallet: <strong className="text-gray-200">{order.payoutWallet || 'Mobikwik'}</strong>
                        </span>
                        <span>
                          FamPay ID: <strong className="text-gray-200">sagarmaster@fam</strong>
                        </span>
                      </div>

                      {/* Actions: Confirm / Reject */}
                      <div className="flex space-x-2 pt-1 border-t border-gray-800/80">
                        <button
                          type="button"
                          onClick={() => handleApproveOrderUtr(order.id)}
                          className="flex-1 py-2.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm &amp; Credit Full Balance (₹{(order.amount + order.income).toFixed(2)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectOrderUtr(order.id)}
                          className="px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: DASHBOARD / OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Pending UTR Notice Banner if any */}
              {pendingUtrOrders.length > 0 && (
                <div className="bg-gradient-to-r from-amber-950/80 to-amber-900/60 p-3.5 rounded-2xl border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {pendingUtrOrders.length} Order(s) Awaiting UTR Confirmation
                      </div>
                      <p className="text-[10px] text-amber-200">
                        Users have submitted payment UTRs. Review and approve cashback.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setActiveTab('approvals');
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                  >
                    Review Now
                  </button>
                </div>
              )}

              {/* Quick Metrics 4-Box Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-900/90 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Active Account Balance</span>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    ₹ {appState.balance.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-gray-500">{user.phone} ({user.name})</span>
                </div>

                <div className="bg-gray-900/90 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Platform Users</span>
                  <div className="text-xl font-black text-white mt-0.5">
                    {usersList.length} Accounts
                  </div>
                  <span className="text-[10px] text-emerald-400">All authenticated</span>
                </div>

                <div className="bg-gray-900/90 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Cashback Yield Rate</span>
                  <div className="text-xl font-black text-amber-400 mt-0.5">
                    {appState.commissionRate.toFixed(2)} %
                  </div>
                  <span className="text-[10px] text-gray-500">Per claim cycle</span>
                </div>

                <div className="bg-gray-900/90 p-3.5 rounded-2xl border border-gray-800">
                  <span className="text-[11px] text-gray-400 block font-medium">USDT / INR Fixed Rate</span>
                  <div className="text-xl font-black text-sky-400 mt-0.5">
                    ₹ {appState.usdtRate}
                  </div>
                  <span className="text-[10px] text-gray-500">Real-time settlement</span>
                </div>
              </div>

              {/* Total Inflow vs Outflow */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block">Total Deposits</span>
                    <span className="text-sm font-black text-emerald-400">₹ {appState.depositTotal.toFixed(0)}</span>
                  </div>
                </div>

                <div className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block">Total Withdrawals</span>
                    <span className="text-sm font-black text-purple-400">₹ {appState.withdrawalTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Auto-Selling Dispatch Engine */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-850 p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Power className={`w-4 h-4 ${appState.isSellingActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <h4 className="text-xs font-bold text-white">Auto-Selling Dispatch Engine</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        appState.isSellingActive ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {appState.isSellingActive ? 'Running & Auto-Matching Claims' : 'Paused / Manual Mode'}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setAppState((prev) => ({
                      ...prev,
                      isSellingActive: !prev.isSellingActive,
                    }));
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appState.isSellingActive
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {appState.isSellingActive ? 'Stop Engine' : 'Start Engine'}
                </button>
              </div>

              {/* Quick Admin Actions Box */}
              <div className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Quick Simulation & Testing Controls</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setAppState((prev) => ({
                        ...prev,
                        balance: prev.balance + 1000,
                        depositTotal: prev.depositTotal + 1000,
                      }));
                      const newTx: Transaction = {
                        id: `TX-ADMIN-${Date.now()}`,
                        type: 'deposit',
                        amount: 1000,
                        status: 'completed',
                        title: 'Admin Quick Test Top-up (+₹1000)',
                        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      setTransactions((prev) => [newTx, ...prev]);
                      showToast('+₹1,000 test balance added!');
                    }}
                    className="p-2.5 bg-gray-800 hover:bg-gray-750 text-white rounded-xl text-xs font-bold border border-gray-700 cursor-pointer text-left"
                  >
                    <span className="block text-emerald-400">+₹1,000 Quick Balance</span>
                    <span className="text-[10px] text-gray-400">Credit current user</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateBatchOrders}
                    className="p-2.5 bg-gray-800 hover:bg-gray-750 text-white rounded-xl text-xs font-bold border border-gray-700 cursor-pointer text-left"
                  >
                    <span className="block text-sky-400">Generate 4 Orders</span>
                    <span className="text-[10px] text-gray-400">Populate claim pool</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Direct Balance Adjuster Box */}
              <div className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-[#0FA968]" />
                    <span>User Balance Adjuster</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                    Instant Effect
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-gray-400 block font-medium">Select Account</label>
                  <select
                    value={selectedUserPhone}
                    onChange={(e) => setSelectedUserPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#0FA968]"
                  >
                    {usersList.map((u) => (
                      <option key={u.phone} value={u.phone}>
                        {u.name} ({u.phone}) - ID: {u.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Reason / Note</label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="e.g. VIP Bonus, Correction"
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[100, 500, 1000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        adjustAmount === preset
                          ? 'bg-[#0FA968] text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustBalance('credit')}
                    className="flex-1 py-2 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Credit ₹{adjustAmount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdjustBalance('debit')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Debit ₹{adjustAmount}</span>
                  </button>
                </div>
              </div>

              {/* User Directory Header & Search */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-300">
                    Registered Users Directory ({filteredUsers.length})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleManualSyncUsers}
                    disabled={isSyncingUsers}
                    className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-750 text-gray-200 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1 border border-gray-700 shadow-sm disabled:opacity-50 transition-all"
                    title="Force Refresh Cloud Users"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingUsers ? 'animate-spin' : ''}`} />
                    <span>Sync Cloud</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="px-2.5 py-1.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by phone, name, or account ID..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0FA968]"
                />
              </div>

              {/* Add User Modal Subform */}
              {showAddUserModal && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-4 bg-gray-900 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Create New User Account</span>
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Vijay Sharma"
                        className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Password</label>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Initial Balance (₹)</label>
                      <input
                        type="number"
                        value={newUserInitialBalance}
                        onChange={(e) => setNewUserInitialBalance(Number(e.target.value))}
                        className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Register & Activate Account
                  </button>
                </form>
              )}

              {/* Users List Cards */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const isCurrent = u.phone === user.phone;
                  const isEditing = editingUserPhone === u.phone;

                  return (
                    <div
                      key={u.phone}
                      className={`p-3.5 rounded-2xl border transition-all text-xs ${
                        isCurrent
                          ? 'bg-gray-900 border-emerald-500/50 shadow-md'
                          : 'bg-gray-900/80 border-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-white text-sm">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                Current Active
                              </span>
                            )}
                            {u.isBanned && (
                              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                                Suspended
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-300 font-mono mt-0.5">
                            📱 {u.phone} • ID: <span className="text-amber-400 font-bold">{u.id}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] mt-0.5">
                            <span className="text-emerald-400 font-extrabold">
                              Balance: ₹{(typeof u.balance === 'number' ? u.balance : (getUserAccountData(u.phone, registeredUsers).appState.balance)).toFixed(2)}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-300">
                              {u.ordersCount !== undefined ? u.ordersCount : (getUserAccountData(u.phone, registeredUsers).orders || []).filter(o => o.status === 'completed' || o.status === 'processing').length} Orders
                            </span>
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                              Permanent ID
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            PIN: {u.pin || '123456'} • Pass: {u.password || '••••••'}
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserPhone(u.phone);
                              sounds.playTap();
                              showToast(`Selected ${u.phone} for adjustments`);
                            }}
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] font-bold rounded-lg cursor-pointer"
                            title="Select for balance adjustment"
                          >
                            Adjust
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingUserPhone(null);
                              } else {
                                setEditingUserPhone(u.phone);
                                setEditUserName(u.name);
                                setEditUserPass(u.password || '');
                                setEditUserPin(u.pin || '');
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-white rounded cursor-pointer"
                            title="Edit user credentials"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleUserBan(u.phone)}
                            className={`p-1 rounded cursor-pointer ${
                              u.isBanned ? 'text-emerald-400 hover:bg-emerald-950' : 'text-rose-400 hover:bg-rose-950'
                            }`}
                            title={u.isBanned ? 'Unban Account' : 'Suspend Account'}
                          >
                            {u.isBanned ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleSwitchUser(u)}
                              className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                              title="Login as this user"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Login As</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* In-line Edit subform */}
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Name</label>
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="w-full p-1.5 bg-gray-950 border border-gray-700 rounded-lg text-[11px] text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Password</label>
                              <input
                                type="text"
                                value={editUserPass}
                                onChange={(e) => setEditUserPass(e.target.value)}
                                className="w-full p-1.5 bg-gray-950 border border-gray-700 rounded-lg text-[11px] text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">PIN</label>
                              <input
                                type="text"
                                value={editUserPin}
                                onChange={(e) => setEditUserPin(e.target.value)}
                                maxLength={6}
                                className="w-full p-1.5 bg-gray-950 border border-gray-700 rounded-lg text-[11px] text-white font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingUserPhone(null)}
                              className="px-2.5 py-1 text-[10px] text-gray-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveUserEdit(u.phone)}
                              className="px-3 py-1 bg-[#0FA968] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Save Credentials
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTIONS & APPROVALS */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-300">Transactions & Requests</div>
                <div className="flex bg-gray-900 rounded-xl p-1 space-x-1 border border-gray-800">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'deposits', label: 'Deposits' },
                    { id: 'withdrawals', label: 'Withdrawals' },
                    { id: 'claims', label: 'Claims' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setTxFilter(filter.id as typeof txFilter)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        txFilter === filter.id ? 'bg-[#0FA968] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions List */}
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No transactions match the selected filter.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-200">{tx.title}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              tx.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : tx.status === 'processing'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          ID: {tx.id} • {tx.date}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`font-black text-sm ${
                            tx.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount}
                        </span>

                        {/* Status override actions */}
                        {tx.status === 'processing' && (
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateTxStatus(tx.id, 'completed')}
                              className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded cursor-pointer"
                              title="Approve / Mark Completed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTxStatus(tx.id, 'failed')}
                              className="p-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded cursor-pointer"
                              title="Reject / Mark Failed"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDER POOL MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Create New Order Box */}
              <form
                onSubmit={handleCreateOrder}
                className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-3"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-[#0FA968]" />
                    <span>Add Merchant Claim Order</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateBatchOrders}
                    className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                  >
                    + Generate 4 Presets
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Principal Amount (₹)</label>
                    <input
                      type="number"
                      value={newOrderAmount}
                      onChange={(e) => {
                        const amt = Number(e.target.value);
                        setNewOrderAmount(amt);
                        setNewOrderIncome(Math.round((amt * appState.commissionRate) / 100));
                      }}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Cashback Reward (Income)</label>
                    <input
                      type="number"
                      value={newOrderIncome}
                      onChange={(e) => setNewOrderIncome(Number(e.target.value))}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Category Filter</label>
                    <select
                      value={newOrderCategory}
                      onChange={(e) => setNewOrderCategory(e.target.value)}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                    >
                      <option value="100-499">100-499</option>
                      <option value="500-1999">500-1999</option>
                      <option value="2000-4999">2000-4999</option>
                      <option value="5000+">5000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Currency</label>
                    <select
                      value={newOrderCurrency}
                      onChange={(e) => setNewOrderCurrency(e.target.value as 'INR' | 'USDT')}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USDT">USDT ($)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Create & Dispatch to Claim Pool
                </button>
              </form>

              {/* Existing Orders List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span>Active Order Pool ({orders.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setOrders((prev) => prev.map((o) => ({ ...o, status: 'available' })));
                      showToast('All claimed orders reset to Available');
                    }}
                    className="text-[11px] text-[#0FA968] hover:underline cursor-pointer"
                  >
                    Reset All to Available
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{o.id}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded">
                            {o.currency}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Principal: ∫ {o.amount.toLocaleString()} • Profit: +₹{o.income}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span
                            className={`text-[9px] font-bold inline-block px-1.5 py-0.2 rounded ${
                              o.status === 'available'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : o.status === 'processing'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {o.status === 'processing' ? 'UTR SUBMITTED' : o.status.toUpperCase()}
                          </span>
                          {o.utr && (
                            <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                              UTR: {o.utr}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {(o.status === 'processing' || (o.utr && o.status !== 'completed' && o.status !== 'claimed')) && (
                          <button
                            type="button"
                            onClick={() => handleApproveOrderUtr(o.id)}
                            className="px-2 py-1 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center space-x-1 shadow-sm"
                            title="Approve UTR & Release Cashback"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve (+₹{o.income})</span>
                          </button>
                        )}
                        {(o.status === 'claimed' || o.status === 'completed') && (
                          <button
                            type="button"
                            onClick={() => handleResetOrderStatus(o.id)}
                            className="p-1.5 text-emerald-400 hover:bg-gray-800 rounded-lg cursor-pointer"
                            title="Make available again"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(o.id)}
                          className="p-1.5 text-rose-400 hover:bg-gray-800 rounded-lg cursor-pointer"
                          title="Remove order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM CONFIG & BROADCAST */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Rates Settings */}
              <form
                onSubmit={handleSaveRates}
                className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-3"
              >
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-[#0FA968]" />
                  <span>Global Rates & Bonus Configuration</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Cashback (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editRate}
                      onChange={(e) => setEditRate(Number(e.target.value))}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      USDT/INR (₹)
                    </label>
                    <input
                      type="number"
                      value={editUsdtRate}
                      onChange={(e) => setEditUsdtRate(Number(e.target.value))}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Welcome Bonus (₹)
                    </label>
                    <input
                      type="number"
                      value={editBonusAmount}
                      onChange={(e) => setEditBonusAmount(Number(e.target.value))}
                      className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0FA968] hover:bg-[#0c8e57] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Global Parameters
                </button>
              </form>

              {/* Broadcast Announcement to Inboxes */}
              <form
                onSubmit={handleBroadcast}
                className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-3"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span>Broadcast Push Notification</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">
                    Appears in users&apos; Message inboxes
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement Title (e.g. System Upgrade Completed)"
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white mb-2"
                  />
                  <textarea
                    rows={2}
                    value={announcementBody}
                    onChange={(e) => setAnnouncementBody(e.target.value)}
                    placeholder="Notice Content..."
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white mb-2"
                  />
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-gray-300">
                      <input
                        type="radio"
                        name="priority"
                        checked={announcementPriority === 'normal'}
                        onChange={() => setAnnouncementPriority('normal')}
                        className="accent-[#0FA968]"
                      />
                      <span>Normal</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-amber-400">
                      <input
                        type="radio"
                        name="priority"
                        checked={announcementPriority === 'urgent'}
                        onChange={() => setAnnouncementPriority('urgent')}
                        className="accent-amber-400"
                      />
                      <span>Urgent Alert</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Broadcast to All Inboxes
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Master Console Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
