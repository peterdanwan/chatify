// frontend/src/App.jsx

import { Route, Routes, Navigate } from 'react-router';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import PageLoader from './components/PageLoader';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useAuthStore } from './store/useAuthStore';
import GlowBlob from './components/GlowBlob';
import DeleteUserPage from './pages/DeleteUserPage';

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  // Use the useEffect hook for "side effects" (things that interact with the outside world beyond React's rendering)
  // Common side effects:
  // 1. API Calls (e.g., like checkAuth())
  // 2. DOM manipulation (changing document title, focus, etc.)
  // 3. Timers (setTimeout, setInterval)
  // 4. Subscriptions (WebSockets, event listeners)
  // 5. localStorage/sessionStorage operations
  // 6. Logging / analytics
  //
  // Side effects: should NOT happen during render (they belong in useEffect instead)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <div
      id="app"
      className="min-h-screen p-2 lg:p-4 bg-slate-900 relative flex items-center justify-center "
    >
      {/* DECORATORS - GRID BG & GLOW SHAPES in the corner (hidden on mobile) */}
      <div
        className="absolute inset-0 hidden lg:block
        bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]
        bg-size-[14px_24px]"
      />
      <GlowBlob position="top-left" backgroundColour="bg-pink-500" />
      <GlowBlob position="bottom-right" backgroundColour="bg-cyan-500" />
      <Routes>
        {/* Redirect users to the login page when not authenticated */}
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        {/* Redirect users to the home page when authenticated */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        {/* Redirect users to the home page when authenticated */}
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/delete-user" element={authUser ? <DeleteUserPage /> : <Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
