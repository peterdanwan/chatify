// frontend/src/components/SignUpForm.jsx

import { useState } from 'react';

import { useAuthStore } from '../store/useAuthStore';
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';
import { AtSignIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react';

function SignUpForm() {
  const { signup, isSigningUp } = useAuthStore();

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const handleInputChange = (event, fieldName) => {
    setFormData({ ...formData, [fieldName]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      {/* Name */}
      <FormInput
        label="Name"
        id="display-name"
        value={formData.displayName}
        onChange={(e) => handleInputChange(e, 'displayName')}
        placeholder="John Doe"
        icon={UserIcon}
      />

      {/* Username */}
      <FormInput
        label="Username"
        id="username"
        value={formData.username}
        onChange={(e) => handleInputChange(e, 'username')}
        placeholder="johndoe"
        icon={AtSignIcon}
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

      {/* Submit Button — variant defaults to "default" (cyan) */}
      <SubmitButton className="mbs-4" isLoading={isSigningUp}>
        Create Account
      </SubmitButton>
    </form>
  );
}
export default SignUpForm;
