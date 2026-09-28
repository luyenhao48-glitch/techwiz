import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService.js';
import i18n from '../i18n/index.js';

const AuthContext = createContext(null);

export const DEMO_ACCOUNT = {
  email: 'demo@fandomverse.io',
  password: 'demo1234',
  role: 'user',
  name: 'Fan Demo',
};

export const ADMIN_ACCOUNT = {
  email: 'admin@gmail.com',
  password: 'admin123',
  role: 'admin',
  name: 'Trần Quản Trị (Administrator)',
};

function ensureInitialUsers(users) {
  let updated = Array.isArray(users) ? [...users] : [];

  // Ensure chief admin user exists with current credentials and admin role
  const adminIdx = updated.findIndex(
    (u) => u.id === 'user-admin' || u.email === ADMIN_ACCOUNT.email || u.email === 'admin@fandomverse.io'
  );
  if (adminIdx === -1) {
    updated.push({
      id: 'user-admin',
      name: ADMIN_ACCOUNT.name,
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
      role: 'admin',
      fandomInterest: 'gaming',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  } else {
    updated[adminIdx] = {
      ...updated[adminIdx],
      id: 'user-admin',
      name: ADMIN_ACCOUNT.name,
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
      role: 'admin',
    };
  }

  // Ensure demo regular user exists with user role
  const demoIdx = updated.findIndex((u) => u.email === DEMO_ACCOUNT.email);
  if (demoIdx === -1) {
    updated.push({
      id: 'user-demo',
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      role: 'user',
      fandomInterest: 'anime',
      createdAt: '2026-01-15T08:00:00.000Z',
    });
  } else {
    // Explicitly guarantee demo user is ONLY regular user, not admin
    updated[demoIdx] = {
      ...updated[demoIdx],
      role: 'user',
    };
  }

  // Ensure role field exists on any other accounts
  return updated.map((u) => ({
    ...u,
    role: u.email === ADMIN_ACCOUNT.email ? 'admin' : (u.role || 'user'),
  }));
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => ensureInitialUsers(storageService.loadUsers()));
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    const saved = storageService.loadCurrentUser();
    if (saved === 'admin@fandomverse.io') return ADMIN_ACCOUNT.email;
    return saved;
  });

  useEffect(() => {
    storageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storageService.saveCurrentUser(currentUserEmail);
  }, [currentUserEmail]);

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.email === currentUserEmail);
    if (!found) return null;
    const { password, ...publicUser } = found;
    return publicUser;
  }, [users, currentUserEmail]);

  const isAdmin = useMemo(() => {
    return currentUser?.role === 'admin' || currentUserEmail === ADMIN_ACCOUNT.email;
  }, [currentUser, currentUserEmail]);

  const register = ({ name, email, password, fandomInterest }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((u) => u.email === normalizedEmail);
    if (exists) {
      return { success: false, message: i18n.t('auth.emailAlreadyRegistered') };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: normalizedEmail,
      password,
      role: 'user',
      fandomInterest,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserEmail(normalizedEmail);
    return { success: true };
  };

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    // Allow either current ADMIN password or previous fallbacks
    const match = users.find(
      (u) =>
        u.email === normalizedEmail &&
        (u.password === password ||
          (u.email === ADMIN_ACCOUNT.email &&
            (password === ADMIN_ACCOUNT.password || password === 'admin123' || password === 'admin2026@')))
    );
    if (!match) {
      return { success: false, message: i18n.t('auth.invalidCredentials') || 'Email hoặc mật khẩu không chính xác.' };
    }
    setCurrentUserEmail(normalizedEmail);
    return { success: true, user: match, isAdmin: match.role === 'admin' };
  };

  const adminLogin = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const match = users.find(
      (u) =>
        u.email === normalizedEmail &&
        (u.password === password ||
          (u.email === ADMIN_ACCOUNT.email &&
            (password === ADMIN_ACCOUNT.password || password === 'admin123' || password === 'admin2026@')))
    );
    if (!match) {
      return { success: false, message: 'Email hoặc mật khẩu Quản trị viên không chính xác.' };
    }
    if (match.role !== 'admin' && match.email !== ADMIN_ACCOUNT.email) {
      return {
        success: false,
        message: 'Tài khoản này không có quyền truy cập khu vực Quản trị viên (Admin Portal).',
      };
    }
    setCurrentUserEmail(normalizedEmail);
    return { success: true, user: match };
  };

  const logout = () => {
    setCurrentUserEmail(null);
  };

  // Switch account quickly
  const switchAccount = (email) => {
    const match = users.find((u) => u.email === email);
    if (match) {
      setCurrentUserEmail(email);
      return true;
    }
    return false;
  };

  // User management methods for Admin
  const updateUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const deleteUser = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (target?.email === ADMIN_ACCOUNT.email) {
      return { success: false, message: 'Không thể xóa tài khoản Quản trị viên tối cao.' };
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUserEmail(null);
    }
    return { success: true };
  };

  const addUser = ({ name, email, password, role = 'user', fandomInterest = 'anime' }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { success: false, message: 'Email này đã tồn tại trong hệ thống.' };
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: normalizedEmail,
      password,
      role,
      fandomInterest,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return { success: true, user: newUser };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin,
        users,
        register,
        login,
        adminLogin,
        logout,
        switchAccount,
        updateUserRole,
        deleteUser,
        addUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
