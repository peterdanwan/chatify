// frontend/src/components/PageLoader.jsx
import { LoaderIcon } from 'lucide-react';

function PageLoader() {
  return (
    // These styles will take the entire screen
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="size-10 animate-spin" />
    </div>
  );
}
export default PageLoader;
