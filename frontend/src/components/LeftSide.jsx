// frontend/src/components/LeftSide.jsx

function LeftSide({ children }) {
  return (
    <div
      id="left-side"
      className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30"
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
export default LeftSide;
