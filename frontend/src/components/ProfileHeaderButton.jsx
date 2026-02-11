// frontend/src/components/ProfileHeaderButton.jsx

export default function ProfileHeaderButton({ onClick, dataTip, children }) {
  return (
    <div className="tooltip tooltip-bottom tooltip-info bg-transparent pt-2" data-tip={dataTip}>
      <button
        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    </div>
  );
}
