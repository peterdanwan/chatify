// frontend/src/components/NameFilter.jsx

import { SearchIcon, XIcon } from 'lucide-react';
import { useRef } from 'react';
import { useChatStore } from '../store/useChatStore';

function NameFilter({ activeTab }) {
  const { nameFilter, setNameFilter } = useChatStore();
  const inputRef = useRef(null);

  const text = activeTab === 'chats' ? 'Resume chatting with...' : "Enter your contact's name";
  const id = activeTab === 'chats' ? 'chats-filter' : 'contacts-filter';

  return (
    <div id={id} className="mx-4 mt-4">
      <div className="rounded-full flex bg-cyan-500/20 items-center ring-2 ring-transparent focus-within:ring-cyan-400 transition-all hover:bg-cyan-500/40 active:bg-cyan-500/40">
        <input
          ref={inputRef}
          type="text"
          id="fullname"
          name="fullname"
          placeholder={text}
          className="w-full bg-transparent outline-none ps-4 py-2 text-white placeholder-white/50"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        {nameFilter ? (
          <button onClick={() => setNameFilter('')} className="hover:cursor-pointer pe-3">
            <XIcon className="self-center text-white/70" />
          </button>
        ) : (
          <button onClick={() => inputRef.current.focus()} className="hover:cursor-text pe-3">
            <SearchIcon className="self-center text-white/70" />
          </button>
        )}
      </div>
    </div>
  );
}
export default NameFilter;
