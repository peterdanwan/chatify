// frontend/src/pages/LoginPage.jsx

import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import { Link } from 'react-router';
import ProviderButtons from '../components/ProviderButtons';
import LoginForm from '../components/LoginForm';
import Header from '../components/Header';
import LoginGraphic from '../components/LoginGraphic';
import Divider from '../components/Divider';
import LeftSide from '../components/LeftSide';
import RightSideContainer from '../components/RightSide';

function LoginPage() {
  return (
    <div id="login-page" className="w-full flex items-center justify-center bg-slate-900 ">
      {/* Max width is set. height is 650px on small screens, and height is 800px when on medium sized screens and above */}
      {/* h-[560px] replaced with h-162.5 | md:h-[800px] replaced with */}
      <div className="w-full relative max-w-6xl">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            <LeftSide>
              <Header title="Welcome Back" subtitle="Login to access your chats" />
              <LoginForm />
              <Divider className="py-6">Or continue with</Divider>
              <ProviderButtons />
              <div className="text-center pbs-7">
                <Link to="/signup" className="auth-link">
                  Don't have an account? Sign up here.
                </Link>
              </div>
            </LeftSide>

            <RightSideContainer>
              <LoginGraphic />
            </RightSideContainer>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default LoginPage;
