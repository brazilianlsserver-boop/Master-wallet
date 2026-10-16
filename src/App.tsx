/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialUser, initialOrders, initialTransactions, initialWallets, initialAnnouncements } from './data/mockData';
import { AppState, ClaimOrder, Transaction, User, Wallet, Announcement } from './types';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { ToolScreen } from './screens/ToolScreen';
import { StatisticsScreen } from './screens/StatisticsScreen';
import { MyAssetScreen } from './screens/MyAssetScreen';
import { OrderDetailScreen } from './screens/OrderDetailScreen';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { RobotMascot } from './components/RobotMascot';
import { AddWalletModal } from './components/modals/AddWalletModal';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { CustomerServiceModal } from './components/modals/CustomerServiceModal';
import { PrivacyModal } from './components/modals/PrivacyModal';
import { ForgotPasswordModal } from './components/modals/ForgotPasswordModal';
import { UsdtModal } from './components/modals/UsdtModal';
import { TaskModal } from './components/modals/TaskModal';
import { TeamModal } from './components/modals/TeamModal';
import { OrderModal } from './components/modals/OrderModal';
import { PinModal } from './components/modals/PinModal';
import { TutorialModal } from './components/modals/TutorialModal';
import { IntegralModal } from './components/modals/IntegralModal';
import { MessageModal } from './components/modals/MessageModal';
import { DetailModal } from './components/modals/DetailModal';
import { WelcomeBonusModal } from './components/modals/WelcomeBonusModal';
import { AdminPanelModal } from './components/admin/AdminPanelModal';
import { ActiveOrderPopupModal } from './components/modals/ActiveOrderPopupModal';
import { OrderApprovalSuccessModal } from './components/modals/OrderApprovalSuccessModal';
import { DownloadApkModal } from './components/modals/DownloadApkModal';
import { sounds } from './utils/audio';
import {
  getStoredActivePhone,
  saveStoredActivePhone,
  getStoredUsersDirectory,
  saveStoredUsersDirectory,
  getUserAccountData,
  saveUserAccountData,
  generateUniqueUserId,
  saveUserActiveOrderId,
  getUserActiveOrderId,
  saveGlobalPendingOrder,
  removeGlobalPendingOrder,
  UserAccountData,
} from './utils/userStorage';
import {
  apiRegisterUser,
  apiLoginUser,
  apiFetchUserData,
  apiFetchAllUsers,
  apiFetchAnnouncements,
  apiClaimOrder,
  apiSubmitUtr,
  apiCancelOrder,
} from './utils/api';


export default function App() {
  // Navigation & Auth State
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, User>>(() => {
    return getStoredUsersDirectory();
  });

  const [activeLoginPhone, setActiveLoginPhone] = useState<string>(() => {
    return getStoredActivePhone();
  });

  // 2nd Requirement: When a new user opens the app, they must be on the Login page
  // "isme jab ak new user app open karta h to use login page par hona chahiye taki vo apni new id bna ske"
  const [user, setUser] = useState<User>(() => {
    const hasActiveSession = sessionStorage.getItem('okpay_session_active') === 'true';
    const active = getStoredActivePhone();
    const account = getUserAccountData(active);
    return { ...account.user, isLoggedIn: hasActiveSession };
  });

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // App metrics & storage tied to the active user's ID and purchases
  const [appState, setAppState] = useState<AppState>(() => {
    const active = getStoredActivePhone();
    return getUserAccountData(active).appState;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const active = getStoredActivePhone();
    return getUserAccountData(active).wallets;
  });

  const [orders, setOrders] = useState<ClaimOrder[]>(() => {
    const active = getStoredActivePhone();
    return getUserAccountData(active).orders;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const active = getStoredActivePhone();
    return getUserAccountData(active).transactions;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('okpay_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  // Modals state
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [activeClaimOrder, setActiveClaimOrder] = useState<ClaimOrder | null>(() => {
    const active = getStoredActivePhone();
    const account = getUserAccountData(active);
    if (account.activeOrderId && account.orders) {
      const match = account.orders.find((o) => o.id === account.activeOrderId);
      if (match && match.status !== 'completed' && match.status !== 'cancelled') {
        return match;
      }
    }
    const processing = (account.orders || []).find(
      (o) => o.userId === account.user.id && o.status === 'processing'
    );
    return processing || null;
  });
  const [isActiveOrderPopupOpen, setIsActiveOrderPopupOpen] = useState<boolean>(() => {
    const active = getStoredActivePhone();
    const account = getUserAccountData(active);
    if (account.activeOrderId && account.orders) {
      const match = account.orders.find((o) => o.id === account.activeOrderId);
      if (match && match.status !== 'completed' && match.status !== 'cancelled') {
        return true;
      }
    }
    return false;
  });
  const [viewingOrderDetail, setViewingOrderDetail] = useState<boolean>(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isUsdtOpen, setIsUsdtOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isIntegralOpen, setIsIntegralOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWelcomeBonusOpen, setIsWelcomeBonusOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [approvedOrderSuccess, setApprovedOrderSuccess] = useState<ClaimOrder | null>(null);
  const [isDownloadApkOpen, setIsDownloadApkOpen] = useState(false);

  // Claimed task IDs
  const [claimedTasks, setClaimedTasks] = useState<string[]>(() => {
    const active = getStoredActivePhone();
    const account = getUserAccountData(active);
    return account.claimedTaskIds || [];
  });

  // Quick toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Listen to referral link parameters on URL load: ?ref=... or ?invite=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('invite');
      if (ref && ref.trim()) {
        localStorage.setItem('okpay_pending_ref_code', ref.trim());
        if (!user.isLoggedIn) {
          setAuthView('register');
        }
      }
    } catch {
      // ignore
    }
  }, [user.isLoggedIn]);

  // 3rd Requirement: Real-time Continuous Device Storage Auto-Save
  useEffect(() => {
    if (user && user.phone) {
      const dataToSave: UserAccountData = {
        user,
        appState,
        orders,
        transactions,
        wallets,
        claimedTaskIds: claimedTasks,
        lastSavedAt: new Date().toISOString(),
      };
      saveUserAccountData(user.phone, dataToSave);
      saveStoredActivePhone(user.phone);
    }
  }, [user, appState, orders, transactions, wallets, claimedTasks]);

  // Flush on pagehide / beforeunload to guarantee zero data loss on phone restart or tab close
  useEffect(() => {
    const handleFlush = () => {
      if (user && user.phone) {
        saveUserAccountData(user.phone, {
          user,
          appState,
          orders,
          transactions,
          wallets,
          lastSavedAt: new Date().toISOString(),
        });
      }
    };
    window.addEventListener('beforeunload', handleFlush);
    window.addEventListener('pagehide', handleFlush);
    return () => {
      window.removeEventListener('beforeunload', handleFlush);
      window.removeEventListener('pagehide', handleFlush);
    };
  }, [user, appState, orders, transactions, wallets]);

  useEffect(() => {
    localStorage.setItem('okpay_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Continuous Global User Directory & Announcements Sync (runs immediately on mount and every 3s across login/logout states)
  useEffect(() => {
    const syncAllUsersDirectory = async () => {
      try {
        const cloudUsers = await apiFetchAllUsers();
        if (cloudUsers && Object.keys(cloudUsers).length > 0) {
          setRegisteredUsers((prev) => {
            const merged = { ...getStoredUsersDirectory(), ...prev, ...cloudUsers };
            saveStoredUsersDirectory(merged);
            return merged;
          });
        }
      } catch (err) {
        // silent
      }

      try {
        const cloudAnnouncements = await apiFetchAnnouncements();
        if (cloudAnnouncements && cloudAnnouncements.length > 0) {
          setAnnouncements((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newNotices = cloudAnnouncements.filter((a) => !existingIds.has(a.id));
            if (newNotices.length > 0) {
              const myNewReferral = newNotices.find(
                (a) => a.targetPhone === user?.phone && a.title.includes('Referral')
              );
              if (myNewReferral && user?.isLoggedIn) {
                sounds.playSuccess();
                showToast('🎉 New Referral Joined! You unlocked ₹500 in Tasks!');
              }
              return [...newNotices, ...prev];
            }
            return prev;
          });
        }
      } catch (err) {
        // silent
      }
    };

    syncAllUsersDirectory();
    const interval = setInterval(syncAllUsersDirectory, 3000);
    return () => clearInterval(interval);
  }, [user?.phone, user?.isLoggedIn]);

  // Helper: Switch Account Session seamlessly while preserving each user's unique ID & balance
  const switchAccountSession = (targetPhone: string, overrideUser?: User) => {
    // 1. Flush previous user data to device storage
    if (user && user.phone) {
      saveUserAccountData(user.phone, {
        user,
        appState,
        orders,
        transactions,
        wallets,
        lastSavedAt: new Date().toISOString(),
      });
    }

    // 2. Load target account from device storage
    const targetData = getUserAccountData(targetPhone);
    const activeUser = overrideUser
      ? { ...overrideUser, isLoggedIn: true }
      : { ...targetData.user, isLoggedIn: true };

    setUser(activeUser);
    setAppState(targetData.appState);
    setOrders(targetData.orders || initialOrders);
    setTransactions(targetData.transactions || []);
    setWallets(targetData.wallets || initialWallets);
    setActiveLoginPhone(targetPhone);
    saveStoredActivePhone(targetPhone);
    setRegisteredUsers((prev) => {
      const merged = { ...getStoredUsersDirectory(), ...prev };
      if (activeUser && activeUser.phone) {
        merged[activeUser.phone] = activeUser;
      }
      return merged;
    });

    const targetActiveOrderId = targetData.activeOrderId || getUserActiveOrderId(targetPhone);
    if (targetActiveOrderId && targetData.orders) {
      const match = targetData.orders.find((o) => o.id === targetActiveOrderId);
      if (match && match.status !== 'completed' && match.status !== 'cancelled') {
        setActiveClaimOrder(match);
        setIsActiveOrderPopupOpen(true);
      } else {
        setActiveClaimOrder(null);
        setIsActiveOrderPopupOpen(false);
      }
    } else {
      setActiveClaimOrder(null);
      setIsActiveOrderPopupOpen(false);
    }
    setViewingOrderDetail(false);
  };

  // User return detection after payment:
  // "jaise hi user payment karne ke bad aaye to vo order usme popup ho jaye"
  useEffect(() => {
    const handleReturn = () => {
      if (document.visibilityState === 'visible') {
        const activeId = getUserActiveOrderId(user.phone);
        const pending =
          activeClaimOrder ||
          orders.find(
            (o) =>
              (o.id === activeId || o.userId === user.id) &&
              (o.status === 'processing' || Boolean(o.utr)) &&
              o.status !== 'completed' &&
              o.status !== 'cancelled'
          );
        if (pending) {
          setActiveClaimOrder(pending);
          setIsActiveOrderPopupOpen(true);
        }
      }
    };

    window.addEventListener('visibilitychange', handleReturn);
    window.addEventListener('focus', handleReturn);
    return () => {
      window.removeEventListener('visibilitychange', handleReturn);
      window.removeEventListener('focus', handleReturn);
    };
  }, [user.phone, user.id, activeClaimOrder, orders]);

  // Real-Time Cloud Server Sync: Automatically updates balance across all phones
  // (e.g. When Admin approves an order, user's balance instantly increases +₹103 and pops up success message!)
  useEffect(() => {
    if (!user.isLoggedIn || !user.phone) return;

    const syncWithServer = async () => {
      try {
        const cloudData = await apiFetchUserData(user.phone);
        if (cloudData && cloudData.user && cloudData.account) {
          const cloudOrders = cloudData.account.orders || [];

          // 2nd Requirement: Detect if any order was confirmed/approved by Admin!
          const newlyApproved = (cloudOrders as ClaimOrder[]).find(
            (co: ClaimOrder) =>
              co.status === 'completed' &&
              orders.some((localO) => localO.id === co.id && localO.status !== 'completed')
          );

          if (newlyApproved) {
            setApprovedOrderSuccess(newlyApproved);
            setActiveClaimOrder((prev) => (prev && prev.id === newlyApproved.id ? newlyApproved : prev));
            sounds.playCoinChime();
            showToast(
              `🎉 Order #${newlyApproved.id} Approved! +₹${(
                (newlyApproved.amount || 0) + (newlyApproved.income || 0)
              ).toFixed(2)} credited to your wallet!`
            );
          }

          if (cloudData.account.appState && cloudData.account.appState.balance !== appState.balance) {
            setAppState(cloudData.account.appState);
            setUser((prev) => ({ ...prev, balance: cloudData.account.appState.balance }));
            if (cloudOrders.length > 0) {
              setOrders(cloudOrders);
            }
            if (cloudData.account.transactions && cloudData.account.transactions.length > 0) {
              setTransactions(cloudData.account.transactions);
            }
          } else if (newlyApproved && cloudOrders.length > 0) {
            setOrders(cloudOrders);
            if (cloudData.account.appState) {
              setAppState(cloudData.account.appState);
              setUser((prev) => ({ ...prev, balance: cloudData.account.appState.balance }));
            }
          }
        }

        // Also keep users directory synchronized across all devices
        const allUsers = await apiFetchAllUsers();
        if (allUsers) {
          setRegisteredUsers((prev) => ({ ...prev, ...allUsers }));
          saveStoredUsersDirectory(allUsers);
        }
      } catch {
        // silent fail for offline
      }
    };

    const interval = setInterval(syncWithServer, 2500);
    return () => clearInterval(interval);
  }, [user.isLoggedIn, user.phone, appState.balance, orders]);

  // Listen to instant approval events triggered from Admin Panel on same or other window
  useEffect(() => {
    const handleOrderApproved = (e: Event) => {
      const customEvent = e as CustomEvent<{ order: ClaimOrder; phone: string }>;
      if (customEvent.detail && customEvent.detail.phone === user.phone) {
        const approved = customEvent.detail.order;
        setApprovedOrderSuccess(approved);
        setActiveClaimOrder((prev) => (prev && prev.id === approved.id ? approved : prev));
        sounds.playCoinChime();
        showToast(
          `🎉 Order #${approved.id} Approved! +₹${(
            (approved.amount || 0) + (approved.income || 0)
          ).toFixed(2)} credited!`
        );
      }
    };

    window.addEventListener('okpay_order_approved', handleOrderApproved);
    return () => window.removeEventListener('okpay_order_approved', handleOrderApproved);
  }, [user.phone]);

  // Automated Selling Loop when selling is turned ON
  useEffect(() => {
    if (!appState.isSellingActive || !user.isLoggedIn) return;

    const interval = setInterval(() => {
      // Find an available order to auto-match
      const availableOrder = orders.find((o) => o.status === 'available');
      if (availableOrder) {
        handleConfirmClaim(availableOrder, true);
        showToast(`Auto-matched order ${availableOrder.id}: +₹${availableOrder.income} earned!`);
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [appState.isSellingActive, orders, user.isLoggedIn]);

  // Handlers
  const handleLogin = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedPhone = phone.trim();

    // 1. Try logging in via Cloud Server first so accounts created on any phone work instantly
    try {
      const serverRes = await apiLoginUser({ phone: trimmedPhone, password });
      if (serverRes && serverRes.success && serverRes.user) {
        const cloudUser = serverRes.user;
        const allCloudUsers = await apiFetchAllUsers();
        const merged = {
          ...getStoredUsersDirectory(),
          ...(allCloudUsers || {}),
          [trimmedPhone]: cloudUser,
        };
        saveStoredUsersDirectory(merged);
        setRegisteredUsers(merged);

        sessionStorage.setItem('okpay_session_active', 'true');
        switchAccountSession(trimmedPhone, cloudUser);

        if (serverRes.isNewUser) {
          setIsWelcomeBonusOpen(true);
          showToast(`Welcome! Your unique User ID is ${cloudUser.id}. +₹30 reward credited!`);
        } else if (cloudUser.role === 'admin' || trimmedPhone === '8949263502') {
          setIsAdminOpen(true);
          showToast('Welcome Admin Sagar Master! Master console opened.');
        } else {
          showToast(`Welcome back, ${cloudUser.name} (ID: ${cloudUser.id})!`);
        }
        return { success: true };
      } else if (serverRes && !serverRes.success && serverRes.error && !serverRes.error.includes('Network error')) {
        return { success: false, error: serverRes.error };
      }
    } catch (e) {
      console.warn('Server login error, using local fallback:', e);
    }

    // 2. Offline / Local fallback
    if (trimmedPhone === '8949263502') {
      if (password === '7689921898%%%') {
        const adminAccount: User = {
          phone: '8949263502',
          id: 'ADMIN-8949',
          name: 'Sagar Master (Admin)',
          password: '7689921898%%%',
          pin: '123456',
          inviteCode: '894926',
          role: 'admin',
          isLoggedIn: true,
          createdAt: '2026-10-10',
        };
        sessionStorage.setItem('okpay_session_active', 'true');
        switchAccountSession('8949263502', adminAccount);
        setIsAdminOpen(true);
        showToast('Welcome Admin Sagar Master! Master console opened.');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Incorrect Admin password. Please check your credentials.',
        };
      }
    }

    const dir = getStoredUsersDirectory();
    let account = dir[trimmedPhone];

    if (!account) {
      // Auto-register new account seamlessly with unique 6-digit User ID
      const newId = generateUniqueUserId(dir);
      account = {
        phone: trimmedPhone,
        id: newId,
        name: `OK User ${trimmedPhone.slice(-4)}`,
        password: password,
        isLoggedIn: true,
        pin: '123456',
        inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
        role: 'user',
        createdAt: new Date().toISOString().split('T')[0],
        balance: 30,
      };
      dir[trimmedPhone] = account;
      saveStoredUsersDirectory(dir);
      setRegisteredUsers(dir);

      sessionStorage.setItem('okpay_session_active', 'true');
      switchAccountSession(trimmedPhone, account);
      setIsWelcomeBonusOpen(true);
      showToast(`Welcome! Your unique User ID is ${newId}. +₹30 reward credited!`);
      return { success: true };
    } else if (account.password && account.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    sessionStorage.setItem('okpay_session_active', 'true');
    switchAccountSession(trimmedPhone, { ...account, isLoggedIn: true });
    showToast(`Welcome back, ${account.name} (ID: ${account.id})!`);
    return { success: true };
  };

  const handleLogout = () => {
    sessionStorage.removeItem('okpay_session_active');
    if (user && user.phone) {
      saveUserAccountData(user.phone, {
        user: { ...user, isLoggedIn: false },
        appState,
        orders,
        transactions,
        wallets,
        lastSavedAt: new Date().toISOString(),
      });
    }
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    setActiveClaimOrder(null);
    setViewingOrderDetail(false);
    setIsActiveOrderPopupOpen(false);
    setAuthView('login');
    showToast('Logged out. Your User ID and balance remain safe on this device.');
  };

  const handleRegisterSuccess = async ({
    phone,
    name,
    password,
    inviteCode,
  }: {
    phone: string;
    name: string;
    password: string;
    inviteCode?: string;
  }) => {
    sessionStorage.setItem('okpay_session_active', 'true');
    const trimmedPhone = phone.trim();
    const trimmedInvite = (inviteCode || '').trim();

    localStorage.removeItem('okpay_pending_ref_code');

    // 1. Sync registration to Cloud Server over internet so Admin on other phones sees it immediately!
    let newUserObj: User;
    try {
      const cloudRes = await apiRegisterUser({
        phone: trimmedPhone,
        name,
        password,
        inviteCode: trimmedInvite,
      });
      if (cloudRes && cloudRes.user) {
        newUserObj = cloudRes.user;
      } else {
        const dir = getStoredUsersDirectory();
        const newId = generateUniqueUserId(dir);
        let localInviterPhone: string | undefined;
        if (trimmedInvite) {
          const inv = Object.values(dir).find(
            (u) => u.inviteCode === trimmedInvite || u.phone === trimmedInvite || u.id === trimmedInvite
          );
          if (inv && inv.phone !== trimmedPhone) {
            localInviterPhone = inv.phone;
          }
        }
        newUserObj = {
          phone: trimmedPhone,
          name,
          password,
          id: newId,
          isLoggedIn: true,
          pin: '123456',
          inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
          referredBy: localInviterPhone,
          role: trimmedPhone === '8949263502' ? 'admin' : 'user',
          createdAt: new Date().toISOString().split('T')[0],
          balance: 30,
        };
      }
    } catch {
      const dir = getStoredUsersDirectory();
      const newId = generateUniqueUserId(dir);
      let localInviterPhone: string | undefined;
      if (trimmedInvite) {
        const inv = Object.values(dir).find(
          (u) => u.inviteCode === trimmedInvite || u.phone === trimmedInvite || u.id === trimmedInvite
        );
        if (inv && inv.phone !== trimmedPhone) {
          localInviterPhone = inv.phone;
        }
      }
      newUserObj = {
        phone: trimmedPhone,
        name,
        password,
        id: newId,
        isLoggedIn: true,
        pin: '123456',
        inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
        referredBy: localInviterPhone,
        role: trimmedPhone === '8949263502' ? 'admin' : 'user',
        createdAt: new Date().toISOString().split('T')[0],
        balance: 30,
      };
    }

    // Real referral in-app notification & transaction for local inviter if exists
    if (newUserObj.referredBy) {
      const inviterAcc = getUserAccountData(newUserObj.referredBy);
      if (inviterAcc) {
        const refNotice: Announcement = {
          id: `msg-ref-${Date.now()}`,
          title: '🎉 New Referral Joined Your Team!',
          content: `Congratulations! ${newUserObj.name} (${newUserObj.phone.slice(0, 4)}****${newUserObj.phone.slice(-2)}) joined OK PAY using your invite code/link! You can claim ₹500 from Tasks now!`,
          date: 'Just now',
          unread: true,
          priority: 'urgent',
          targetPhone: newUserObj.referredBy,
        };
        inviterAcc.transactions.unshift({
          id: `TX-REF-${Date.now()}`,
          type: 'referral',
          amount: 500,
          status: 'completed',
          title: `Referral Joined: ${newUserObj.name} (Claim ₹500 in Tasks)`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        saveUserAccountData(newUserObj.referredBy, inviterAcc);
        setAnnouncements((prev) => [refNotice, ...prev]);
      }
    }

    const dir = getStoredUsersDirectory();
    dir[trimmedPhone] = newUserObj;
    saveStoredUsersDirectory(dir);
    setRegisteredUsers((prev) => ({ ...prev, ...dir }));

    // Also pull all other users from server so none are missed
    apiFetchAllUsers().then((cloudUsers) => {
      if (cloudUsers) {
        const combined = { ...getStoredUsersDirectory(), ...cloudUsers, [trimmedPhone]: newUserObj };
        saveStoredUsersDirectory(combined);
        setRegisteredUsers(combined);
      }
    }).catch(() => {});

    switchAccountSession(trimmedPhone, newUserObj);
    setIsWelcomeBonusOpen(true);
    showToast(`Account created! Unique User ID: ${newUserObj.id} (Synced with Cloud Server)`);
  };

  // Wallet operations
  const handleAddWallet = (newWalletData: Omit<Wallet, 'id' | 'createdAt'>) => {
    const newWallet: Wallet = {
      ...newWalletData,
      id: `w-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setWallets((prev) => {
      if (newWallet.isDefault) {
        return [newWallet, ...prev.map((w) => ({ ...w, isDefault: false }))];
      }
      return [...prev, newWallet];
    });

    showToast(`${newWallet.type} wallet bound successfully`);
  };

  const handleDeleteWallet = (walletId: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId));
    showToast('Wallet removed');
  };

  const handleSetDefaultWallet = (walletId: string) => {
    setWallets((prev) =>
      prev.map((w) => ({
        ...w,
        isDefault: w.id === walletId,
      }))
    );
    showToast('Default wallet updated');
  };

  // User claims order: Save order in user's ID and device storage
  // "3rd......agar koi user ak order claim kere to use dusra order claim n karne de jab tak ki vo phla order konfirn ya cancle na kre"
  const handleStartClaimOrder = (order: ClaimOrder) => {
    // Single active order check: Block user from taking another order until current is confirmed or cancelled
    const activeId = getUserActiveOrderId(user.phone);
    const existingActiveOrder =
      activeClaimOrder ||
      orders.find(
        (o) =>
          (o.userId === user.id || o.userPhone === user.phone || o.id === activeId) &&
          (o.status === 'processing' || Boolean(o.utr)) &&
          o.status !== 'completed' &&
          o.status !== 'cancelled'
      );

    if (existingActiveOrder && existingActiveOrder.id !== order.id) {
      sounds.playError();
      showToast(
        `Pehle se ek order active hai (${existingActiveOrder.id})! Kripya pehle use confirm ya cancel karein.`
      );
      setActiveClaimOrder(existingActiveOrder);
      setIsActiveOrderPopupOpen(true);
      return;
    }

    const claimedOrder: ClaimOrder = {
      ...order,
      userId: user.id,
      userPhone: user.phone,
      userName: user.name,
      claimedAt: new Date().toISOString(),
      status: 'claimed',
      utr: undefined,
    };

    const updatedOrders = orders.map((o) => (o.id === order.id ? claimedOrder : o));
    setOrders(updatedOrders);
    setActiveClaimOrder(claimedOrder);
    setViewingOrderDetail(true);
    saveUserActiveOrderId(user.phone, order.id);

    // Record order claim on cloud server (awaits user UTR entry)
    apiClaimOrder(claimedOrder, user.phone).catch(() => {});

    // Synchronous immediate save to ensure device storage sees it right now
    if (user && user.phone) {
      saveUserAccountData(user.phone, {
        user,
        appState,
        orders: updatedOrders,
        transactions,
        wallets,
        activeOrderId: order.id,
        lastSavedAt: new Date().toISOString(),
      });
    }

    showToast(`Order ${order.id} claimed! Submit your 12-digit payment UTR below.`);
  };

  // User cancels order: Releases order so user can choose another order
  // "sath me us order me order cancel ka bhi option add kar do jisse agar user ye order lene ki bhay dusra order lena ho to vo use cancel kar ske"
  const handleCancelOrder = (orderToCancel: ClaimOrder) => {
    const resetOrder: ClaimOrder = {
      ...orderToCancel,
      status: 'available',
      utr: undefined,
      userId: undefined,
      userPhone: undefined,
      userName: undefined,
      cancelledAt: new Date().toISOString(),
    };

    const updatedOrders = orders.map((o) => (o.id === orderToCancel.id ? resetOrder : o));
    setOrders(updatedOrders);

    setActiveClaimOrder(null);
    setViewingOrderDetail(false);
    setIsActiveOrderPopupOpen(false);
    saveUserActiveOrderId(user.phone, null);

    // Remove from global pending queue and cloud server
    removeGlobalPendingOrder(orderToCancel.id);
    if (user && user.phone) {
      apiCancelOrder(orderToCancel.id, user.phone).catch(() => {});
    }

    if (user && user.phone) {
      saveUserAccountData(user.phone, {
        user,
        appState,
        orders: updatedOrders,
        transactions,
        wallets,
        activeOrderId: null,
        lastSavedAt: new Date().toISOString(),
      });
    }

    showToast(`Order ${orderToCancel.id} cancelled. You can now select another order.`);
  };

  // Claim Order operation
  const handleConfirmClaim = (order: ClaimOrder, isAuto = false) => {
    // 1st Requirement: When user submits UTR, order enters processing state.
    // Do NOT claim cashback until Admin confirms from Admin Panel!
    if (order.status === 'processing') {
      const processingOrder: ClaimOrder = {
        ...order,
        status: 'processing',
        utr: order.utr,
        userId: user.id,
        userPhone: user.phone,
        userName: user.name,
      };
      const updatedOrders = orders.map((o) => (o.id === order.id ? processingOrder : o));
      setOrders(updatedOrders);
      setActiveClaimOrder(processingOrder);
      saveUserActiveOrderId(user.phone, order.id);

      // Save to global pending queue so Admin sees it immediately!
      saveGlobalPendingOrder(processingOrder);

      // Sync UTR submission to Cloud Server over internet so Admin on any device sees it!
      if (order.utr && user.phone) {
        apiSubmitUtr({
          orderId: order.id,
          utr: order.utr,
          phone: user.phone,
          payoutWallet: order.payoutWallet,
        }).catch(() => {});
      }

      if (user && user.phone) {
        saveUserAccountData(user.phone, {
          user,
          appState,
          orders: updatedOrders,
          transactions,
          wallets,
          activeOrderId: order.id,
          lastSavedAt: new Date().toISOString(),
        });
      }

      showToast(`UTR ${order.utr} submitted! Awaiting Admin confirmation.`);
      return;
    }

    // 1. Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'claimed',
              utr: order.utr || o.utr,
              userId: user.id,
              userPhone: user.phone,
              userName: user.name,
            }
          : o
      )
    );

    setActiveClaimOrder(null);
    setIsActiveOrderPopupOpen(false);
    saveUserActiveOrderId(user.phone, null);
    removeGlobalPendingOrder(order.id);

    // 2. Update balances: User receives full purchase amount + cashback (e.g. 100 buy + 3 cashback = 103 total)
    const totalPayout = order.amount + order.income;
    setAppState((prev) => ({
      ...prev,
      balance: prev.balance + totalPayout,
      commissionTotal: prev.commissionTotal + order.income,
      sellTotal: prev.sellTotal + order.amount,
      rewardTotal: prev.rewardTotal + order.income,
      integralPoints: prev.integralPoints + 10,
    }));

    // 3. Add transaction
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      type: 'claim_income',
      amount: totalPayout,
      status: 'completed',
      title: isAuto
        ? `Auto-Claim Order (${order.id}) • +₹${totalPayout}`
        : order.utr
        ? `Order Settled (${order.id} • UTR: ${order.utr}) • +₹${totalPayout}`
        : `Claim Order (${order.id}) • +₹${totalPayout}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (!isAuto) {
      if (order.utr) {
        showToast(`UTR ${order.utr} Verified! ₹${order.amount} Refund + ₹${order.income} Cashback (Total ₹${totalPayout}) credited to ID ${user.id}!`);
      } else {
        showToast(`+₹${totalPayout} credited to ID ${user.id}!`);
      }
    }
  };

  // Refresh available order pool
  const handleRefreshOrders = () => {
    const newBatch: ClaimOrder[] = [
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 12000,
        income: 504,
        category: '5000+',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 8500,
        income: 357,
        category: '5000+',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 4200,
        income: 176.4,
        category: '2000-4999',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 1800,
        income: 75.6,
        category: '500-1999',
        status: 'available',
      },
      {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        currency: 'INR',
        amount: 350,
        income: 14.7,
        category: '100-499',
        status: 'available',
      },
    ];

    setOrders((prev) => [...newBatch, ...prev]);
    showToast('New merchant payment claims added to pool!');
  };

  // Deposit operation
  const handleDepositSuccess = (amount: number, channel: string) => {
    setAppState((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      depositTotal: prev.depositTotal + amount,
    }));

    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      type: 'deposit',
      amount,
      status: 'completed',
      title: `Deposit via ${channel}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      walletType: channel,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Deposited ₹${amount} successfully!`);
  };

  // Withdrawal operation
  const handleWithdrawSuccess = (amount: number, wallet: Wallet) => {
    setAppState((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      withdrawalTotal: prev.withdrawalTotal + amount,
    }));

    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      type: 'withdrawal',
      amount,
      status: 'completed',
      title: `Withdrawal to ${wallet.type}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      walletType: wallet.type,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Withdrawal of ₹${amount} submitted`);
  };

  // Toggle Selling Active
  const handleToggleSelling = () => {
    setAppState((prev) => {
      const nextState = !prev.isSellingActive;
      if (nextState) {
        showToast('Selling Activated! Orders will match automatically.');
      } else {
        showToast('Closed Selling.');
      }
      return {
        ...prev,
        isSellingActive: nextState,
        inProcessOrders: nextState ? 1 : 0,
        inProcessAmount: nextState ? 2000 : 0,
      };
    });
  };

  // Integral Exchange
  const handleRedeemIntegral = (pointsUsed: number, cashReward: number) => {
    setAppState((prev) => ({
      ...prev,
      integralPoints: prev.integralPoints - pointsUsed,
      balance: prev.balance + cashReward,
    }));
    showToast(`Exchanged ${pointsUsed} pts for ₹${cashReward}!`);
  };

  // Task claim
  const handleTaskRewardClaim = (reward: number, title: string, taskId?: string) => {
    if (taskId) {
      setClaimedTasks((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
    }
    setAppState((prev) => ({
      ...prev,
      balance: prev.balance + reward,
      rewardTotal: prev.rewardTotal + reward,
    }));
    setTransactions((prev) => [
      {
        id: `TX-TASK-${Date.now()}`,
        type: 'referral',
        amount: reward,
        status: 'completed',
        title: `Task Reward: ${title}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
    sounds.playSuccess();
    showToast(`+₹${reward.toLocaleString()} credited to your wallet for ${title}!`);
  };

  return (
    <div className="min-h-screen bg-[#E5ECEC] flex items-center justify-center font-sans antialiased">
      {/* Toast floating banner */}
      {toastMessage && (
        <div className="fixed top-5 z-50 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-semibold backdrop-blur-sm animate-in fade-in slide-in-from-top-3 flex items-center space-x-2 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#0FA968] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main mobile screen container matching standard mobile phone viewport */}
      <div className="w-full max-w-md bg-[#F4F8F8] min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col justify-between">
        {!user.isLoggedIn ? (
          /* Authentication Screens */
          authView === 'login' ? (
            <LoginScreen
              onLogin={handleLogin}
              onGoToRegister={() => setAuthView('register')}
              onGoToForgotPassword={() => setIsForgotPasswordOpen(true)}
              onOpenPrivacy={() => setIsPrivacyOpen(true)}
              onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
              initialPhone=""
            />
          ) : (
            <RegisterScreen
              onBackToLogin={() => setAuthView('login')}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )
        ) : viewingOrderDetail && activeClaimOrder ? (
          <OrderDetailScreen
            order={activeClaimOrder}
            wallets={wallets}
            onBack={() => {
              setViewingOrderDetail(false);
              if (activeClaimOrder && activeClaimOrder.status !== 'completed' && activeClaimOrder.status !== 'cancelled') {
                setIsActiveOrderPopupOpen(true);
              }
            }}
            onConfirmPayment={(order) => {
              handleConfirmClaim(order, false);
            }}
            onOpenAddWallet={() => {
              setViewingOrderDetail(false);
              setIsAddWalletOpen(true);
            }}
            onCancelOrder={handleCancelOrder}
          />
        ) : (
          /* Main Authenticated Screens */
          <>
            <main className="flex-1">
              {currentTab === 'home' && (
                <HomeScreen
                  user={user}
                  appState={appState}
                  transactions={transactions}
                  onOpenDetail={() => setIsDetailOpen(true)}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdrawal={() => setIsWithdrawOpen(true)}
                  onOpenUsdt={() => setIsUsdtOpen(true)}
                  onOpenTask={() => setIsTaskOpen(true)}
                  onOpenTeam={() => setIsTeamOpen(true)}
                  onOpenOrder={() => setIsOrderOpen(true)}
                  onOpenNotifications={() => setIsMessageOpen(true)}
                  onSeeAllTransactions={() => setIsDetailOpen(true)}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
                />
              )}

              {currentTab === 'payment' && (
                <PaymentScreen
                  appState={appState}
                  orders={orders}
                  activeOrder={
                    activeClaimOrder ||
                    orders.find(
                      (o) =>
                        (o.userId === user.id || o.userPhone === user.phone || o.id === getUserActiveOrderId(user.phone)) &&
                        (o.status === 'processing' || Boolean(o.utr)) &&
                        o.status !== 'completed' &&
                        o.status !== 'cancelled'
                    )
                  }
                  onClaimOrder={(order) => {
                    handleStartClaimOrder(order);
                  }}
                  onOpenAddWallet={() => setIsAddWalletOpen(true)}
                  onRefreshOrders={handleRefreshOrders}
                  onCancelOrder={handleCancelOrder}
                />
              )}

              {currentTab === 'tool' && (
                <ToolScreen
                  wallets={wallets}
                  onOpenAddWallet={() => setIsAddWalletOpen(true)}
                  onDeleteWallet={handleDeleteWallet}
                  onSetDefaultWallet={handleSetDefaultWallet}
                />
              )}

              {currentTab === 'statistics' && (
                <StatisticsScreen
                  appState={appState}
                  onToggleSelling={handleToggleSelling}
                  onOpenExchangeModal={() => setIsUsdtOpen(true)}
                />
              )}

              {currentTab === 'my' && (
                <MyAssetScreen
                  appState={appState}
                  user={user}
                  onLogout={handleLogout}
                  onOpenWallet={() => {
                    setCurrentTab('tool');
                  }}
                  onOpenIntegral={() => setIsIntegralOpen(true)}
                  onOpenService={() => setIsCustomerServiceOpen(true)}
                  onOpenMessage={() => setIsMessageOpen(true)}
                  onOpenPin={() => setIsPinOpen(true)}
                  onOpenTutorial={() => setIsTutorialOpen(true)}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdrawal={() => setIsWithdrawOpen(true)}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
                />
              )}
            </main>

            {/* Floating Robot Mascot (visible across in-app screens) */}
            <RobotMascot
              onClick={() => setIsCustomerServiceOpen(true)}
            />

            {/* Bottom 5-Tab Navigation Bar */}
            <BottomNavBar
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab)}
            />
          </>
        )}
      </div>

      {/* Interactive Modals */}
      <AddWalletModal
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onAddWallet={handleAddWallet}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        balance={appState.balance}
        wallets={wallets}
        userPin={user.pin}
        onWithdrawSuccess={handleWithdrawSuccess}
        onOpenAddWallet={() => {
          setIsWithdrawOpen(false);
          setIsAddWalletOpen(true);
        }}
      />

      <CustomerServiceModal
        isOpen={isCustomerServiceOpen}
        onClose={() => setIsCustomerServiceOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onPasswordReset={(phone, newPass) => {
          setRegisteredUsers((prev) => {
            if (prev[phone]) {
              const updated = {
                ...prev,
                [phone]: { ...prev[phone], password: newPass },
              };
              localStorage.setItem('okpay_registered_users', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
          showToast('Password reset successfully');
        }}
      />

      <UsdtModal
        isOpen={isUsdtOpen}
        onClose={() => setIsUsdtOpen(false)}
        rate={appState.usdtRate}
      />

      <TaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onRewardClaim={handleTaskRewardClaim}
        onOpenTeam={() => {
          setIsTaskOpen(false);
          setIsTeamOpen(true);
        }}
        orders={orders}
        user={user}
        registeredUsers={registeredUsers}
        claimedTasks={claimedTasks}
      />

      <TeamModal
        isOpen={isTeamOpen}
        onClose={() => setIsTeamOpen(false)}
        user={user}
        registeredUsers={registeredUsers}
        onOpenTasks={() => {
          setIsTeamOpen(false);
          setIsTaskOpen(true);
        }}
        showToast={showToast}
      />

      <OrderModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        orders={orders}
        onSelectOrder={(order) => {
          setIsOrderOpen(false);
          setActiveClaimOrder(order);
          setViewingOrderDetail(true);
        }}
        onCancelOrder={handleCancelOrder}
      />

      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        currentPin={user.pin}
        onSavePin={(newPin) => {
          setUser((prev) => ({ ...prev, pin: newPin }));
          showToast('Security PIN changed successfully');
        }}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <IntegralModal
        isOpen={isIntegralOpen}
        onClose={() => setIsIntegralOpen(false)}
        points={appState.integralPoints}
        onRedeem={handleRedeemIntegral}
      />

      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        announcements={announcements}
        userPhone={user.phone}
        onMarkRead={(id) => {
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
          );
        }}
      />

      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={user}
        appState={appState}
        transactions={transactions}
      />

      <WelcomeBonusModal
        isOpen={isWelcomeBonusOpen}
        onClose={() => setIsWelcomeBonusOpen(false)}
        bonusAmount={30}
      />

      <AdminPanelModal
        isOpen={isAdminOpen && (user.role === 'admin' || user.phone === '8949263502')}
        onClose={() => setIsAdminOpen(false)}
        user={user}
        setUser={setUser}
        appState={appState}
        setAppState={setAppState}
        registeredUsers={registeredUsers}
        setRegisteredUsers={setRegisteredUsers}
        orders={orders}
        setOrders={(newOrders) => {
          setOrders((prev) => {
            const next = typeof newOrders === 'function' ? (newOrders as (prev: ClaimOrder[]) => ClaimOrder[])(prev) : newOrders;
            if (activeClaimOrder) {
              const match = next.find((o) => o.id === activeClaimOrder.id);
              if (match) setActiveClaimOrder(match);
            }
            return next;
          });
        }}
        transactions={transactions}
        setTransactions={setTransactions}
        announcements={announcements}
        setAnnouncements={setAnnouncements}
        showToast={showToast}
        onSwitchUser={(targetUser) => {
          sessionStorage.setItem('okpay_session_active', 'true');
          switchAccountSession(targetUser.phone, targetUser);
        }}
      />

      {/* Active Order Popup Modal on Payment Return */}
      <ActiveOrderPopupModal
        isOpen={isActiveOrderPopupOpen}
        order={
          activeClaimOrder ||
          orders.find(
            (o) =>
              (o.userId === user.id || o.userPhone === user.phone || o.id === getUserActiveOrderId(user.phone)) &&
              (o.status === 'processing' || Boolean(o.utr)) &&
              o.status !== 'completed' &&
              o.status !== 'cancelled'
          ) ||
          null
        }
        user={user}
        onClose={() => setIsActiveOrderPopupOpen(false)}
        onOpenOrderDetail={(order) => {
          setIsActiveOrderPopupOpen(false);
          setActiveClaimOrder(order);
          setViewingOrderDetail(true);
        }}
        onCancelOrder={handleCancelOrder}
      />

      {/* Celebratory Order Approval Success Modal */}
      <OrderApprovalSuccessModal
        isOpen={Boolean(approvedOrderSuccess)}
        order={approvedOrderSuccess}
        userBalance={appState.balance}
        onClose={() => setApprovedOrderSuccess(null)}
        onViewWallet={() => {
          setApprovedOrderSuccess(null);
          setViewingOrderDetail(false);
          setCurrentTab('my');
        }}
      />

      {/* Official Android APK Download & Installation Modal */}
      <DownloadApkModal
        isOpen={isDownloadApkOpen}
        onClose={() => setIsDownloadApkOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}
