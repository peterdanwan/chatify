// frontend/src/components/SignUpHeading.jsx

import { MessageCircleIcon } from 'lucide-react';

function SignUpHeader() {
  return (
    <header className="justify-items-center mb-6 ">
      <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
      <h1 className="text-2xl font-bold text-slate-200 mb-2">Create Account</h1>
      <p className="text-slate-400">Sign up for a new account</p>
    </header>
  );
}
export default SignUpHeader;
