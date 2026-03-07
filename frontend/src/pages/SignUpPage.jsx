// frontend/src/pages/SignUpPage.jsx
import { Link } from 'react-router';

import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import SignUpForm from '../components/SignUpForm';
import SignUpHeader from '../components/SignUpHeader';
import SignUpGraphic from '../components/SignUpGraphic';
import ProviderButtons from '../components/ProviderButtons';
import Divider from '../components/Divider';

function SignUpPage() {
  return (
    <div id="signup-page" className="w-full flex items-center justify-center p-4 bg-slate-900 ">
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
                <SignUpHeader />
                <SignUpForm />
                <Divider className="py-6">Or continue with</Divider>
                <ProviderButtons />
                <Divider className="py-6" />
                <div className="text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            {/* SIGNUP IMAGE - RIGHT SIDE*/}
            <div
              id="right-side"
              className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-linear-to-bl from-slate-800/20 to-transparent"
            >
              <SignUpGraphic />
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default SignUpPage;
