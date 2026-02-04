// frontend/src/components/InputField.jsx

function FormInput({ label, id, type = 'text', value, onChange, placeholder, icon }) {
  // This is how we can pass a component as a prop, and use that component without getting ESLint warnings.
  const IconComponent = icon;

  return (
    <div>
      <label htmlFor={id} className="auth-input-label">
        {label}
      </label>
      <div className="relative">
        {/* Relies on Inheritance */}
        <IconComponent className="auth-input-icon" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="input"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
export default FormInput;
