const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Anterior */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium
          bg-white border border-gray-300 text-gray-600
          hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
          transition"
      >
        ← Anterior
      </button>

      {/* Páginas */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
            ${
              p === page
                ? "bg-blue-800 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
        >
          {p}
        </button>
      ))}

      {/* Siguiente */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium
          bg-white border border-gray-300 text-gray-600
          hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
          transition"
      >
        Siguiente →
      </button>
    </div>
  );
};

export default Pagination;
