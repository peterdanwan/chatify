// frontend/src/pages/SignUpPage.jsx
import { Link } from 'react-router';

import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';
import Header from '../components/Header';
import SignUpForm from '../components/SignUpForm';
import Divider from '../components/Divider';
import ProviderButtons from '../components/ProviderButtons';
import SignUpGraphic from '../components/SignUpGraphic';

function SignUpPage() {
  return (
    <div id="signup-page" className="w-full flex items-center justify-center bg-slate-900 ">
      {/* Max width is set. height is 650px on small screens, and height is 800px when on medium sized screens and above */}
      {/* h-[560px] replaced with h-162.5 | md:h-[800px] replaced with */}
      <div className="w-full relative max-w-6xl">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            <LeftSide>
              <Header title="Create Account" subtitle="Sign up for a new account" />
              <SignUpForm />
              <Divider className="py-6">Or continue with</Divider>
              <ProviderButtons />
              <div className="text-center pbs-7">
                <Link to="/login" className="auth-link">
                  Already have an account? Login
                </Link>
              </div>
            </LeftSide>

            <RightSide>
              <SignUpGraphic />
            </RightSide>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default SignUpPage;
