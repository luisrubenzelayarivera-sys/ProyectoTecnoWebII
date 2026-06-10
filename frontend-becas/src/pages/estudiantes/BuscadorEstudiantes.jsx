import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { buscarEstudiantes } from "../../api/becas.api";

const badgeEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":
      return "bg-green-100 text-green-800";
    case "SUSPENDIDA":
      return "bg-yellow-100 text-yellow-800";
    case "FINALIZADA":
      return "bg-gray-100 text-gray-800";
    case "ABANDONADA":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const BuscadorEstudiantes = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (busqueda.trim().length < 2) {
      setError("Ingrese al menos 2 caracteres");
      return;
    }

    setCargando(true);
    setError("");
    try {
      const res = await buscarEstudiantes(busqueda);
      setResultados(res.data);
      setBusquedaRealizada(true);
    } catch (err) {
      setError("Error en la búsqueda");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Búsqueda de Estudiantes
        </h1>
        <p className="text-slate-600 mb-6">
          Busca estudiantes y visualiza su historial de becas
        </p>

        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <form onSubmit={handleBuscar} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre, carnet o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={cargando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {cargando ? "Buscando..." : "Buscar"}
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {/* Resultados */}
        {busquedaRealizada && (
          <>
            {resultados.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
                <svg
                  className="w-12 h-12 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-slate-500 text-sm">
                  No se encontraron estudiantes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {resultados.map((est) => (
                  <div
                    key={est.id_estudiante}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {est.nombre_completo}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {est.carnet && `Carnet: ${est.carnet}`}
                            {est.carnet && est.nombre_carrera && " • "}
                            {est.nombre_carrera}
                          </p>
                          {est.email_ucb && (
                            <p className="text-sm text-slate-500">
                              {est.email_ucb}
                            </p>
                          )}
                          {est.telefono && (
                            <p className="text-sm text-slate-500">
                              Tel: {est.telefono}
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/estudiantes/${est.id_estudiante}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver perfil →
                        </Link>
                      </div>

                      {/* Historial de becas */}
                      {est.becas && est.becas.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 uppercase mb-3">
                            Historial de Becas ({est.becas.length})
                          </p>
                          <div className="space-y-2">
                            {est.becas.map((beca) => (
                              <div
                                key={beca.id_beca}
                                className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-slate-800">
                                    {beca.nombre_beca}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {beca.gestion} - Periodo {beca.periodo} •{" "}
                                    {beca.porcentaje}%
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeEstado(beca.estado_beca)}`}
                                  >
                                    {beca.estado_beca}
                                  </span>
                                  <Link
                                    to={`/becas/${beca.id_beca}`}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  >
                                    Ver →
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs text-slate-500 italic">
                            Sin historial de becas registrado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuscadorEstudiantes;
