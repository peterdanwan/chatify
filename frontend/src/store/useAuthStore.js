// frontend/src/store/useAuthStore.js

/**
 * Zustand functions as a box that stores several different states.
 * For example:
 * 1. Loading State
 * 2. Your Name
 * 3. A function
 *
 * In our application, we can use it in our pages or within our components without prop-drilling.
 */

import { create } from 'zustand';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

import { axiosInstance } from '../lib/axios';
import { useChatStore } from './useChatStore';
import { safeErrorMessage } from '../lib/utils';

// Same thing as frontend/src/lib/axios.js
const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '/';

// Creating a hook:
// create(set, get)
// We use set more than get
export const useAuthStore = create((set, get) => ({
  // State of the auth user.
  // Once we check if the user is authenticated, we can set the state with the User object.
  authUser: null,

  // A loading state regarding if we're checking the auth
  // Should be set to true by default (so that when we refresh a page, we check for this)
  // Once we do check, set to false
  isCheckingAuth: true,

  // A loading state regarding if we're in the process of sending a request to sign up
  // Should be set to false by default
  isSigningUp: false,

  // A loading state regarding if we're in the process of sending a request to log in
  // Should be set to false by default
  isLoggingIn: false,

  // A loading state regarding if we're in the process of sending a request to log in
  // Should be set to false by default
  isLoggingOut: false,

  // A loading state for when the user is updating their profile picture
  isUpdatingProfile: false,

  socket: null,

  onlineUsers: [],

  // Run this function to check if the user is authenticated.
  // This sets the authUser object and isCheckingAuth to false.
  checkAuth: async () => {
    try {
      // If the request fails, the browser logs its own message, something like:
      // GET http://localhost:3000/api/auth/check 401 (Unauthorized) useAuthStore.js:35
      const res = await axiosInstance.get('/auth/check');

      // Runs when there is a success status, e.g.: 2xx
      set({ authUser: res.data });

      get().connectSocket();

      // Initialize chat preferences (e.g., sounds) from user data
      useChatStore.getState().initializePreferences(res.data);
    } catch (error) {
      // Runs for 4xx, 5xx, etc.
      // Logs something like:
      // AxiosError: Request failed with status code 401 at async checkAuth useAuthStore.js:36:19
      console.error('Error in authCheck:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', credentials);
      set({ authUser: res.data });

      toast.success('Account created successfully!');
      get().connectSocket();
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
      console.error('Error with signup', error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', credentials);
      set({ authUser: res.data });

      // Initialize preferences after login
      useChatStore.getState().initializePreferences(res.data);

      toast.success('Logged in successfully');

      get().connectSocket();
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
      console.error('Error with login', error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });

    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });

      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
      console.error('Error with logout', error);
    } finally {
      set({ isLoggingOut: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
    } catch (error) {
      const errorMessage = safeErrorMessage(error);
      toast.error(errorMessage);
      console.error('Error with logout', error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Called after a successful signup, when we login, and every time we check our auth (i.e., when we refresh the page)
  connectSocket: () => {
    const { authUser } = get();
    const existingSocketConnection = get().socket;

    // Prevents socket connection for unauthenticated user / if there's a connection for the client already
    if (!authUser || existingSocketConnection?.connected || existingSocketConnection?.active) {
      return;
    }

    const socket = io(BASE_URL, {
      withCredentials: true, // ensurs cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // Listen for online users event
    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // Called when we log out
  disconnectSocket: () => {
    const socketConnection = get().socket;

    if (!socketConnection) {
      return;
    }

    socketConnection.off('getOnlineUsers');
    socketConnection.disconnect();
    // Drop reference and clear presence
    set({ socket: null, onlineUsers: [] });
  },
}));
