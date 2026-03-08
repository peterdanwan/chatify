// frontend/src/components/Header.jsx

import { MessageCircleIcon } from 'lucide-react';

function Header({ title, subtitle }) {
  return (
    <header className="justify-items-center mbe-6 text-center">
      <MessageCircleIcon className="inline-12 block-12 mx-auto text-slate-400 mbe-4" />
      <h1 className="text-2xl font-bold text-slate-200 mbe-2">{title}</h1>
      <p className="text-slate-400">{subtitle}</p>
    </header>
  );
}
export default Header;
