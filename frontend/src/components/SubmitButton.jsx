// frontend/src/components/SubmitButton.jsx
import { LoaderIcon } from 'lucide-react';

function SubmitButton({ children, isLoading: loadingState }) {
  return (
    <button type="submit" className="auth-btn" disabled={loadingState}>
      {loadingState ? <LoaderIcon className="w-full h-5 animate-spin text-center" /> : children}
    </button>
  );
}
export default SubmitButton;
