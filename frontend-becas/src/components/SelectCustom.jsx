const SelectCustom = ({ value, onChange, name, children, className = "" }) => {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full appearance-none bg-white border border-gray-200
          rounded-xl px-4 py-2.5 text-sm text-gray-700 pr-10
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent transition ${className}`}
      >
        {children}
      </select>
      {/* Flecha SVG personalizada */}
      <div
        className="pointer-events-none absolute inset-y-0 right-3
        flex items-center"
      >
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default SelectCustom;
