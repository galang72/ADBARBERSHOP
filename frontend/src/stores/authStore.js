import { create } from 'zustand';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      toast.success('Login berhasil!');
      return true;
    } catch (error) {
      set({ isLoading: false });
      // Ambil pesan error spesifik dari field errors atau message
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message;
      
      let errorMessage = 'Login gagal';
      if (errors) {
        // Ambil pesan error pertama dari field errors (email, password, dll)
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) errorMessage = firstError;
      } else if (message && message !== 'Validasi gagal') {
        errorMessage = message;
      }
      
      toast.error(errorMessage);
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
      toast.success('Logout berhasil');
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put('/profile', data);
      const updatedUser = response.data;
      
      // Merge with existing user data to keep all fields
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const mergedUser = { ...currentUser, ...updatedUser };
      
      localStorage.setItem('user', JSON.stringify(mergedUser));
      set({ user: mergedUser });
      toast.success('Profil berhasil diupdate');
      return true;
    } catch (error) {
      toast.error('Gagal update profil');
      return false;
    }
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  hasRole: (role) => {
    return get().user?.role === role;
  },
}));
