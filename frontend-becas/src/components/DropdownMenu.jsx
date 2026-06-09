import { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ opciones }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleMenu = () => {
    if (!abierto && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + window.scrollY,
        left: Math.max(rect.right - 176 + window.scrollX, 16),
      });
    }
    setAbierto((prev) => !prev);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition
          text-gray-500 hover:text-gray-800"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/10"
            onMouseDown={() => setAbierto(false)}
          />
          <div
            className="absolute w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            style={menuStyle}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {opciones.map((op, i) => (
              <button
                key={i}
                onClick={() => {
                  op.accion();
                  setAbierto(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition
                  hover:bg-gray-50 flex items-center gap-2
                  ${
                    op.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                  }`}
              >
                {op.icon && <span>{op.icon}</span>}
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
