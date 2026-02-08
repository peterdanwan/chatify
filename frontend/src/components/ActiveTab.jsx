// frontend/src/components/ActiveTab.jsx

import { useChatStore } from '../store/useChatStore';

function ActiveTab({ activeTabName, children }) {
  const { activeTab, setActiveTab } = useChatStore();
  return (
    <button
      className={`tab flex-1 ${activeTab === activeTabName ? 'tab-active bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}
      role="tab"
      onClick={() => {
        setActiveTab(activeTabName);
      }}
    >
      {children}
    </button>
  );
}
export default ActiveTab;
