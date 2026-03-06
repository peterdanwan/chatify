// frontend/src/components/ProviderButton.jsx

function ProviderButton({ icon, children }) {
  const Icon = icon;

  return (
    <button className="flex justify-center items-center gap-2 px-3 py-2 border bg-white border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-700">{children}</span>
    </button>
  );
}

export default ProviderButton;
