import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getBeca } from "../../api/becas.api";

const colorEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":
      return "bg-green-100 text-green-800";
    case "SUSPENDIDA":
      return "bg-yellow-100 text-yellow-800";
    case "FINALIZADA":
      return "bg-gray-100 text-gray-800";
    case "ABANDONADA":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const DetalleBeca = () => {
  const { id } = useParams();
  const [beca, setBeca] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getBeca(id);
        setBeca(res.data);
      } catch (err) {
        setError("Beca no encontrada");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-500 mt-20">Cargando...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/becas" className="text-blue-800 hover:underline text-sm">
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalle de Beca</h1>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        {beca && (
          <div className="flex flex-col gap-4">
            {/* Info principal */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Información general
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                  ${colorEstado(beca.estado_beca)}`}
                >
                  {beca.estado_beca}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Estudiante</p>
                  <p className="font-medium text-gray-800">
                    {beca.nombre_completo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo de beca</p>
                  <p className="font-medium text-gray-800">
                    {beca.nombre_beca}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Porcentaje</p>
                  <p className="font-medium text-gray-800">
                    {beca.porcentaje}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Gestión / Periodo</p>
                  <p className="font-medium text-gray-800">
                    {beca.gestion} - {beca.periodo === 1 ? "I" : "II"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Código documento</p>
                  <p className="font-medium text-gray-800">
                    {beca.cod_doc_respaldo ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Declaración jurada</p>
                  <p className="font-medium text-gray-800">
                    {beca.declaracion_jurada ? "Sí" : "No"}
                  </p>
                </div>
                {beca.observaciones && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Observaciones</p>
                    <p className="font-medium text-gray-800">
                      {beca.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Acciones
              </h2>
              <div className="flex gap-3">
                <Link
                  to={`/becas/${id}/estado`}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800
                    px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cambiar estado
                </Link>
                <Link
                  to="/becas"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700
                    px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Volver a becas
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleBeca;
