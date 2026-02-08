// frontend/src/store/useChatStore.js

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { safeErrorMessage } from '../lib/utils';

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats', // vs. "contacts"
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,

  // Initialize from localStorage (cache), will be overwritten by DB value on load
  isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled')) === true,

  // Initialize user preferences from database
  initializePreferences: (user) => {
    if (user?.enableSound !== undefined) {
      // Database is source of truth
      set({ isSoundEnabled: user.enableSound });
      // Sync localStorage cache
      localStorage.setItem('isSoundEnabled', user.enableSound);
    }
  },

  toggleSound: async () => {
    const newValue = !get().isSoundEnabled;

    // 1. Update UI immediately (optimistic update)
    set({ isSoundEnabled: newValue });
    localStorage.setItem('isSoundEnabled', newValue);

    // 2. Sync to database (fire-and-forget or with error handling)
    try {
      await axiosInstance.put('/auth/preferences', { enableSound: newValue });
    } catch (error) {
      // Rollback on failure
      console.error('Failed to update sound preference:', error);
      set({ isSoundEnabled: !newValue });
      localStorage.setItem('isSoundEnabled', !newValue);
      toast.error('Failed to save preference');
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUserLoading: true });

    try {
      const res = await axiosInstance.get('/messages/contacts');
      set({ allContacts: res.data });
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get('/messages/chats');
      set({ chats: res.data });
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      set({ isUserLoading: false });
    }
  },
}));
