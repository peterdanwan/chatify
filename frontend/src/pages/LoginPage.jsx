// frontend/src/pages/LoginPage.jsx

import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import { Link } from 'react-router';
import ProviderButtons from '../components/ProviderButtons';
import LoginForm from '../components/LoginForm';
import LoginHeader from '../components/LoginHeader';
import LoginGraphic from '../components/LoginGraphic';
import Divider from '../components/Divider';

function LoginPage() {
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
                <LoginHeader />
                <LoginForm />
                <Divider className="py-6">OR</Divider>
                <ProviderButtons />
                <Divider className="py-6">OR</Divider>
                <div className="text-center">
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
              <LoginGraphic />
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default LoginPage;
