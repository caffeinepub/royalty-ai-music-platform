import { useState } from 'react';

const ADMIN_PASSWORD = 'RoyaltyAdmin2026!';
const SESSION_KEY = 'royalty_admin_session';

export function useAdminSession() {
  // Initialize state synchronously from sessionStorage
  const [isAdminSessionActive, setIsAdminSessionActive] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'active';
  });
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(true);

  const login = (password: string): boolean => {
    setError('');
    // Trim whitespace from password input
    const trimmedPassword = password.trim();
    
    if (trimmedPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'active');
      setIsAdminSessionActive(true);
      return true;
    } else {
      setError('Invalid admin password');
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdminSessionActive(false);
  };

  return {
    isAdminSessionActive,
    login,
    logout,
    error,
    isReady,
  };
}
