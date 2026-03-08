// frontend/src/components/ProviderButtons.jsx

import ProviderButton from './ProviderButton';
import FacebookIcon2 from './svg/FacebookIcon';
import GoogleIcon from './svg/GoogleIcon';
import GitHubIcon from './svg/GitHubIcon';

function ProviderButtons() {
  // Get the route parameters somehow
  // Depending on signup vs. login, we need to do different things to trigger the right actions

  return (
    <div id="provider-buttons" className="flex flex-wrap gap-3 mx-auto items-center justify-center">
      <ProviderButton className="flex-1 min-inline-fit" icon={GoogleIcon}>
        Google
      </ProviderButton>
      <ProviderButton className="flex-1 min-inline-fit" icon={FacebookIcon2}>
        Facebook
      </ProviderButton>
      <ProviderButton className="flex-1 min-inline-fit" icon={GitHubIcon}>
        GitHub
      </ProviderButton>
    </div>
  );
}
export default ProviderButtons;
