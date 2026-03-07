// frontend/src/components/LoginForm.jsx

import { useState } from 'react';
import { MailIcon, LockIcon } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import SubmitButton from './SubmitButton';
import FormInput from './FormInput';

function LoginForm() {
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
    <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
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
  );
}
export default LoginForm;
