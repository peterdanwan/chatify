// frontend/src/components/ActiveTab.jsx

import { useChatStore } from '../store/useChatStore';

function ActiveTab({ activeTabName, children, testId }) {
  const { activeTab, setActiveTab } = useChatStore();
  return (
    <button
      date-testid={testId} // No attribute rendered if testId is undefined, null, or false. Having an empty string would cause tate-testid to show up.
      className={`active-tab tab flex-1 ${activeTab === activeTabName ? 'tab-active bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}
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
