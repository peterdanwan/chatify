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
    // There's a closure for messages
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    // As if we are creating a mock-up message for our database
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text,
      image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };

    // Immediately updates the UI by adding this message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text, image });

      // This code just appends the new message to the messages we see.
      // set({messages: [...messages, ...res.data]}); <- create a new array made by spreading out the contents of messages and res.data
      set({ messages: [...messages, res.data] }); // Use original messages + real message
    } catch (error) {
      // Using the closure at the top of the file, we reset messages back to the original messages
      set({ messages: messages });
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      //
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();

    if (!selectedUser) {
      return;
    }

    const socket = useAuthStore.getState().socket;

    if (!socket) {
      return;
    }

    socket.on('newMessage', (newMessage) => {
      // !!
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) {
        return;
      }

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio('/sounds/notification.mp3');

        notificationSound.currentTime = 0; // Reset to start
        notificationSound.play().catch((error) => console.log('Audio play failed:', error));
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
