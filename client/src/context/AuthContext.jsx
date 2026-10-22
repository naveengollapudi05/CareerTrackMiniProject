import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careertrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load user on mount if token is present
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('careertrack_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.profile?.fullName || res.user.username}!`, 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('careertrack_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast('Registration successful! Connected to database.', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('careertrack_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.data) {
        setUser((prev) => ({
          ...prev,
          username: res.data.username,
          profile: res.data.profile,
        }));
        showToast('Profile updated successfully!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
      return { success: false, message: err.message };
    }
  };

  const addSkill = async (skill) => {
    try {
      const res = await api.addSkill(skill);
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            skills: res.skills,
          },
        }));
        showToast(res.message, 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Failed to add skill', 'error');
      return { success: false, message: err.message };
    }
  };

  const removeSkill = async (skillName) => {
    try {
      const res = await api.removeSkill(skillName);
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            skills: res.skills,
          },
        }));
        showToast(res.message, 'info');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Failed to remove skill', 'error');
      return { success: false, message: err.message };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.updatePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast('Password updated successfully!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addSkill,
        removeSkill,
        updatePassword,
        showToast,
        toasts,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
