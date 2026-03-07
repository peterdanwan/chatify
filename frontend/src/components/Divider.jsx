// frontend/src/components/Divider.jsx

function Divider({ children, className }) {
  return (
    <div className={`flex items-center ${children ? 'gap-3' : ''} ${className}`}>
      <div className="flex-1 h-0.5 bg-slate-600/50" />
      {children && <span className="text-sm font-medium text-slate-400">{children}</span>}
      <div className="flex-1 h-0.5 bg-slate-600/50" />
    </div>
  );
}

export default Divider;
