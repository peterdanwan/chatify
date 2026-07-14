// frontend/src/components/ProviderButtons.jsx

import ProviderButton from './ProviderButton';
import FacebookIcon2 from './svg/FacebookIcon';
import GoogleIcon from './svg/GoogleIcon';
import GitHubIcon from './svg/GitHubIcon';

// Same dev/prod split as axios.js: in dev, frontend (5173) and backend (3000) are
// separate origins, so this must be absolute. In production they're the same origin
// (server.ts serves the built frontend), so a relative path resolves correctly on its own.
const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '';

function ProviderButtons() {
  // OAuth2 is a browser-redirect flow, not a fetch/axios call.
  // window.location.href sends the browser to the backend initiation route,
  // which redirects to the provider's login page.
  // After the user approves, the provider redirects back to /api/auth/<provider>/callback,
  // which issues a JWT cookie and redirects back to CLIENT_URL (the frontend root).
  function handleOAuth(provider) {
    return (event) => {
      event.preventDefault();
      window.location.href = `${API_URL}/api/auth/${provider}`;
    };
  }

  return (
    <div id="provider-buttons" className="flex flex-wrap gap-3 mx-auto items-center justify-center">
      <ProviderButton
        className="flex-1 min-inline-fit"
        icon={GoogleIcon}
        onClick={handleOAuth('google')}
      >
        Google
      </ProviderButton>
      <ProviderButton
        className="flex-1 min-inline-fit"
        icon={FacebookIcon2}
        onClick={handleOAuth('facebook')}
      >
        Facebook
      </ProviderButton>
      <ProviderButton
        className="flex-1 min-inline-fit"
        icon={GitHubIcon}
        onClick={handleOAuth('github')}
      >
        GitHub
      </ProviderButton>
    </div>
  );
}
export default ProviderButtons;
