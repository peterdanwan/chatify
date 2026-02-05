// frontend/src/pages/SignUpPage.jsx
import { useState } from 'react';
import { Link } from 'react-router';
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from 'lucide-react';

import FormInput from '../components/FormInput';
import { useAuthStore } from '../store/useAuthStore';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import SubmitButton from '../components/SubmitButton';

function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const handleInputChange = (event, fieldName) => {
    setFormData({ ...formData, [fieldName]: event.target.value });
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900 ">
      {/* Max width is set. height is 650px on small screens, and height is 800px when on medium sized screens and above */}
      {/* h-[560px] replaced with h-162.5 | md:h-[800px] replaced with */}
      <div className="w-full relative max-w-6xl h-162.5 md:h-200">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM + INPUT FIELDS - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="justify-items-center mb-6 ">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Create Account</h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>
                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* First Name */}
                  <FormInput
                    label="First Name"
                    id="first-name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange(e, 'firstName')}
                    placeholder="John"
                    icon={UserIcon}
                  />

                  {/* Last Name */}
                  <FormInput
                    label="Last Name"
                    id="last-name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange(e, 'lastName')}
                    placeholder="Doe"
                    icon={UserIcon}
                  />

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
                        onChange={(e) => handleInputChange(e, 'password')}
                        className="input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <SubmitButton loadingState={isSigningUp}>Create Account</SubmitButton>
                </form>

                <div className="text-center mt-4">
                  {/* Login Link */}
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            {/* SIGNUP IMAGE - RIGHT SIDE*/}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-linear-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>
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
export default SignUpPage;
