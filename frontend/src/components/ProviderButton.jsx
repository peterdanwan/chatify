// frontend/src/components/ProviderButton.jsx

function ProviderButton({ icon, children }) {
  const Icon = icon;

  return (
    <button className="flex justify-center items-center gap-2 px-3 py-2 border bg-white border-gray-400 rounded-lg transition-all duration-150 hover:bg-gray-200 hover:border-gray-400 hover:shadow-sm hover:cursor-pointer active:scale-[0.98] active:bg-gray-300 focus-visible:outline-none focus-visible:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500">
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-700">{children}</span>
    </button>
  );
}

export default ProviderButton;
