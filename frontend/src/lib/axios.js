// frontend/src/lib/axios.js

import axios from 'axios';

// We use our axiosInstance to make api calls to our backend
export const axiosInstance = axios.create({
  // 1. Set our baseURL of our requests based on development
  //    '/api' works since both our frontend & backend are hosted on the same domain
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:3000/api' : '/api',

  // 2. Sets and sends cookies with our requests
  //    Recall our backend leverages cookies for authentication.
  withCredentials: true,
});
