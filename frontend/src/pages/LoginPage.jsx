// frontend/src/pages/LoginPage.jsx

import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LockIcon, MailIcon, MessageCircleIcon } from 'lucide-react';
import SubmitButton from '../components/SubmitButton';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import { Link } from 'react-router';
import FormInput from '../components/FormInput';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleInputChange = (event, fieldName) => {
    setFormData({ ...formData, [fieldName]: event.target.value });
  };

  return (
    <div id="login-page" className="w-full flex items-center justify-center bg-slate-900 ">
      {/* Max width is set. height is 650px on small screens, and height is 800px when on medium sized screens and above */}
      {/* h-[560px] replaced with h-162.5 | md:h-[800px] replaced with */}
      <div className="w-full relative max-w-6xl">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM + INPUT FIELDS - LEFT SIDE */}
            <div
              id="left-side"
              className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30"
            >
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="justify-items-center mb-6 ">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome Back</h2>
                  <p className="text-slate-400">Login to access your chats</p>
                </div>
                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Email */}
                  <FormInput
                    label="Email"
                    id="email"
                    value={formData.email}
                    type="email"
                    onChange={(e) => handleInputChange(e, 'email')}
                    placeholder="johndoe@gmail.com"
                    icon={MailIcon}
                  />

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="auth-input-label">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Submit Button — variant defaults to "default" (cyan) */}
                  <SubmitButton isLoading={isLoggingIn}>Login</SubmitButton>
                </form>

                <div className="text-center mt-4">
                  {/* Signup Link */}
                  <Link to="/signup" className="auth-link">
                    Don't have an account? Sign up here.
                  </Link>
                </div>
              </div>
            </div>

            {/* LOGIN IMAGE - RIGHT SIDE*/}
            <div
              id="right-side"
              className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-linear-to-bl from-slate-800/20 to-transparent"
            >
              <div>
                <img
                  src="/login.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Connect anytime, anywhere</h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default LoginPage;
