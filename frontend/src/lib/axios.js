// frontend/src/lib/axios.js

import axios from 'axios';

// We use our axiosInstance to make api calls to our backend
export const axiosInstance = axios.create({
  // 1. Set our baseURL of our requests based on development
  //    '/api' works since both our frontend & backend are hosted on the same domain
  //    NOTE: import.meta.env.MODE is automatically provided by Vite.
  //          when we run `npm run dev`, vite makes MODE = 'development'
  //          when we run `npm run build`, (or vite build) MODE = 'production'
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:3000/api' : '/api',

  // 2. Sets and sends cookies with our requests
  //    Recall our backend leverages cookies for authentication.
  withCredentials: true,
});

// Request interceptor - logs when request is being made
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - logs when response is received
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Request successful:', response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    // const url = error.config.baseURL + error.config.url;
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText;

      // Explain what failed
      console.error(`Request failed (${error.response.status}): ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Request failed: No response from server');
    } else {
      // Something else happened
      console.error('❌ Request failed:', error.message);
    }
    return Promise.reject(error);
  }
);
