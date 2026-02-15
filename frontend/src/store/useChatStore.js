// frontend/src/store/useChatStore.js

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { safeErrorMessage } from '../lib/utils';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats', // vs. "contacts"
  selectedUser: null,
  isUserLoading: false, // used in ChatsList.jsx & ContactsList.jsx
  isMessagesLoading: false, // used in ChatContainer.jsx

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

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async ({ text, image }) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text,
      image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Immediately update UI with optimistic message
    set({ messages: [...get().messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text, image });

      // FIXED: Replace the optimistic message with the real one from the server
      set({
        messages: get().messages.map((msg) => (msg._id === tempId ? res.data : msg)),
      });
    } catch (error) {
      // Remove the optimistic message on error
      set({
        messages: get().messages.filter((msg) => msg._id !== tempId),
      });
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();

    if (!selectedUser) {
      return;
    }

    const socket = useAuthStore.getState().socket;

    if (!socket) {
      return;
    }

    // FIXED: Use a function to get the latest state instead of closure
    socket.on('newMessage', (newMessage) => {
      const currentSelectedUser = get().selectedUser;

      // Only add message if it's from the currently selected user
      const isMessageSentFromSelectedUser = newMessage.senderId === currentSelectedUser?._id;
      if (!isMessageSentFromSelectedUser) {
        return;
      }

      // Get fresh messages from state
      const currentMessages = get().messages;

      // Check if message already exists (prevent duplicates)
      const messageExists = currentMessages.some((msg) => msg._id === newMessage._id);
      if (!messageExists) {
        set({ messages: [...currentMessages, newMessage] });

        // Play notification sound
        if (get().isSoundEnabled) {
          const notificationSound = new Audio('/sounds/notification.mp3');
          notificationSound.currentTime = 0;
          notificationSound.play().catch((error) => console.log('Audio play failed:', error));
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off('newMessage');
    }
  },
}));
