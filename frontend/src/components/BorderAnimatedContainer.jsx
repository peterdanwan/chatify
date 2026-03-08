// frontend/src/components/BorderAnimated.jsx

// How to make an animated gradient border:
// Ref: https://cruip-tutorials.vercel.app/animated-gradient-border/

function BorderAnimatedContainer({ children }) {
  return (
    <div
      id="border-animated-container"
      className="w-full  border overflow-hidden flex flex-col lg:flex-row border-slate-700
      bg-slate-800/30 rounded-none lg:rounded-2xl
      lg:[background:linear-gradient(45deg,#172033,--theme(--color-slate-800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),--theme(--color-slate-600/.48)_80%,--theme(--color-cyan-500)_86%,--theme(--color-cyan-300)_90%,--theme(--color-cyan-500)_94%,--theme(--color-slate-600/.48))_border-box] 
      lg:border-transparent lg:animate-border"
    >
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
