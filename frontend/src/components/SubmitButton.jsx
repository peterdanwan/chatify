// frontend/src/components/SubmitButton.jsx
import { LoaderIcon } from 'lucide-react';

function SubmitButton({ children, isLoading, className, variant = 'default' }) {
  return (
    <button
      type="submit"
      className={`auth-btn auth-btn--${variant} ${className}`}
      disabled={isLoading}
    >
      {isLoading ? <LoaderIcon className="w-full h-5 animate-spin text-center" /> : children}
    </button>
  );
}

export default SubmitButton;
