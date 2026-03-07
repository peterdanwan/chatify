// frontend/src/components/LoginHeader.jsx

import { MessageCircleIcon } from 'lucide-react';

function LoginHeader() {
  return (
    <header id="login-header" className="justify-items-center mb-6 ">
      <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
      <h1 className="text-2xl font-bold text-slate-200 mb-2">Welcome Back</h1>
      <p className="text-slate-400">Login to access your chats</p>
    </header>
  );
}
export default LoginHeader;
