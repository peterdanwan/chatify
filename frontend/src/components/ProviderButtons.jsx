// frontend/src/components/ProviderButtons.jsx

import ProviderButton from './ProviderButton';
import FacebookIcon2 from './svg/FacebookIcon';
import GoogleIcon from './svg/GoogleIcon';
import GitHubIcon from './svg/GitHubIcon';

function ProviderButtons() {
  return (
    <div id="provider-buttons" className="grid grid-cols-1 gap-3 max-inline-80 mx-auto">
      <ProviderButton icon={GoogleIcon}>Continue with Google</ProviderButton>
      <ProviderButton icon={FacebookIcon2}>Continue with Facebook</ProviderButton>
      <ProviderButton icon={GitHubIcon}>Continue with GitHub</ProviderButton>
    </div>
  );
}
export default ProviderButtons;
