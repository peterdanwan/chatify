// frontend/src/pages/DeleteUserPage.jsx

import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LockIcon, MailIcon, TriangleAlertIcon } from 'lucide-react';
import SubmitButton from '../components/SubmitButton';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import FormInput from '../components/FormInput';
import { Link } from 'react-router';

function DeleteUserPage() {
  const { authUser, deleteUser, isDeletingUser } = useAuthStore();

  // Email is shown read-only purely so the user can confirm which account this is —
  // the backend identifies the account from the session, not from this field.
  // Password confirmation only applies to accounts that have one (OAuth-only accounts don't).
  const [formData, setFormData] = useState({
    email: authUser?.email ?? '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    deleteUser(formData);
  };

  return (
    <div id="delete-user-page" className="w-full flex items-center justify-center bg-slate-900">
      <div className="w-full relative max-w-md">
        <BorderAnimatedContainer>
          <div className="p-8 flex flex-col gap-6">
            {/* HEADING */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4">
                <TriangleAlertIcon className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-2">Delete Account</h2>
              <p className="text-slate-400 text-sm">
                This action is <span className="text-red-400 font-medium">permanent</span> and
                cannot be undone. All your messages and data will be erased.
              </p>
            </div>

            {/* WARNING BANNER */}
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              Enter your credentials below to confirm you want to permanently delete your account.
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email — read-only, shows which account is being deleted */}
              <FormInput
                label="Email"
                id="email"
                value={formData.email}
                type="email"
                readOnly
                onChange={() => {}}
                placeholder="your@email.com"
                icon={MailIcon}
                className="opacity-60 cursor-not-allowed"
              />

              {/* Password confirmation only applies to accounts that have one */}
              {authUser?.hasPassword ? (
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
              ) : (
                <p className="text-slate-400 text-sm">
                  Your account is signed in via Google, GitHub, or Facebook — no password to
                  confirm.
                </p>
              )}

              {/* Submit — error variant signals the destructive nature of the action */}
              <SubmitButton isLoading={isDeletingUser} variant="error">
                Yes, permanently delete my account
              </SubmitButton>
            </form>

            {/* CANCEL LINK */}
            <div className="text-center">
              <Link to="/" className="auth-link">
                ← Never mind, take me back
              </Link>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default DeleteUserPage;
