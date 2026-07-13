// frontend/src/pages/ChooseUsernamePage.jsx

import { useState } from 'react';
import { AtSignIcon } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';

function ChooseUsernamePage() {
  const { updateAccount, isUpdatingAccount, logout } = useAuthStore();
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAccount({ username });
  };

  return (
    <div id="choose-username-page" className="w-full flex items-center justify-center bg-slate-900">
      <div className="w-full relative max-w-md">
        <BorderAnimatedContainer>
          <div className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-200 mb-2">Choose a username</h2>
              <p className="text-slate-400 text-sm">
                One last step — pick a unique username so people can find and add you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormInput
                label="Username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                icon={AtSignIcon}
              />

              <SubmitButton isLoading={isUpdatingAccount}>Continue</SubmitButton>
            </form>

            <div className="text-center">
              <button onClick={logout} className="auth-link cursor-pointer">
                Log out instead
              </button>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChooseUsernamePage;
