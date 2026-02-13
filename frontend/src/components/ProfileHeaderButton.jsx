// frontend/src/components/ProfileHeaderButton.jsx

export default function ProfileHeaderButton({ onClick, dataTip, children }) {
  return (
    <div className="bg-transparent pt-2">
      <button
        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer tooltip tooltip-bottom tooltip-info"
        onClick={onClick}
        type="button"
        data-tip={dataTip}
      >
        {children}
      </button>
    </div>
  );
}
