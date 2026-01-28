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
import { axiosInstance } from '../lib/axios';

// Creating a hook:
// create(set, get)
// We use set more than get
export const useAuthStore = create((set) => ({
  authUser: null,
  isLoggingIn: false,
  isLoading: false,

  // Lets us define functions where we can call "set" to change the values of our various states.
  login: (data) => {
    set({ isLoggedIn: true });

    axiosInstance
      .post('/auth/login', data)
      .then((response) => {
        console.log(response.json());
        console.log('We just logged in');
        set({ isLoggedIn: false });
      })
      .catch((error) => {
        console.error(error);
      });
  },

  logout: () => {
    console.log('We just logged out');
    set({ isLoggedIn: false });
  },
}));
