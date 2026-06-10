import { useState, useRef, useEffect } from "react";

const ICONS = {
  ver: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  estado: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  borrar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};

const DropdownMenu = ({ opciones }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleMenu = () => {
    if (!abierto && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + window.scrollY + 4,
        left: Math.max(rect.right - 180 + window.scrollX, 12),
      });
    }
    setAbierto((prev) => !prev);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-md hover:bg-slate-100 transition text-slate-400 hover:text-slate-700"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0" onMouseDown={() => setAbierto(false)} />
          <div
            className="absolute w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden py-1"
            style={menuStyle}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {opciones.map((op, i) => (
              <button
                key={i}
                onClick={() => { op.accion(); setAbierto(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2.5
                  ${op.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {op.icon && (
                  <span className={op.danger ? "text-red-400" : "text-slate-400"}>
                    {ICONS[op.icon] || null}
                  </span>
                )}
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
