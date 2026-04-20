// frontend/src/components/ProviderButtons.jsx

import ProviderButton from './ProviderButton';
import FacebookIcon2 from './svg/FacebookIcon';
import GoogleIcon from './svg/GoogleIcon';
import GitHubIcon from './svg/GitHubIcon';
import toast from 'react-hot-toast';

function ProviderButtons() {
  // Get the route parameters somehow
  // Depending on signup vs. login, we need to do different things to trigger the right actions
  function onClick(event) {
    event.preventDefault();
    toast.error('Signing up / logging in with O-AUTH not available yet! 😅');
  }

  return (
    <div id="provider-buttons" className="flex flex-wrap gap-3 mx-auto items-center justify-center">
      <ProviderButton className="flex-1 min-inline-fit" icon={GoogleIcon} onClick={onClick}>
        Google
      </ProviderButton>
      <ProviderButton className="flex-1 min-inline-fit" icon={FacebookIcon2} onClick={onClick}>
        Facebook
      </ProviderButton>
      <ProviderButton className="flex-1 min-inline-fit" icon={GitHubIcon} onClick={onClick}>
        GitHub
      </ProviderButton>
    </div>
  );
}
export default ProviderButtons;
