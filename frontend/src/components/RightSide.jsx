// frontend/src/components/RightSide.jsx

function RightSide({ children }) {
  return (
    <div
      id="right-side"
      className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-linear-to-bl from-slate-800/20 to-transparent"
    >
      {children}
    </div>
  );
}
export default RightSide;
