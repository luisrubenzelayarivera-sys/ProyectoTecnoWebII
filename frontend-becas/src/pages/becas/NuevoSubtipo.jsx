import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getBeca, getDisciplinas } from "../../api/becas.api";
import api from "../../api/axios";

const NuevoSubtipo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beca, setBeca] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [subtipo, setSubtipo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [datosSubtipo, setDatosSubtipo] = useState({
    promedio_mantenido: "",
    gestion_obtenido: "",
    semestre_obtenido: "",
    responsable_beca: "",
    hor_completo: false,
    antiguedad: "",
    id_disciplina: "",
    carnet_discapacidad: "",
    porcentaje_disc: "",
    tipo_disc: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resBeca, resDisc] = await Promise.all([
          getBeca(id),
          getDisciplinas(),
        ]);
        setBeca(resBeca.data);
        setDisciplinas(resDisc.data);
      } catch (err) {
        setError("Error al cargar datos");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosSubtipo({
      ...datosSubtipo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      let endpoint = "";
      let datos = {};

      switch (subtipo) {
        case "PROMEDIO":
          endpoint = `/becas/${id}/subtipo/promedio`;
          datos = {
            promedio_mantenido: parseFloat(datosSubtipo.promedio_mantenido),
            gestion_obtenido: parseInt(datosSubtipo.gestion_obtenido),
            semestre_obtenido: parseInt(datosSubtipo.semestre_obtenido),
          };
          break;
        case "RESPONSABLE":
          endpoint = `/becas/${id}/subtipo/responsable`;
          datos = {
            responsable_beca: datosSubtipo.responsable_beca,
            hor_completo: datosSubtipo.hor_completo,
            antiguedad: parseInt(datosSubtipo.antiguedad),
          };
          break;
        case "DISCIPLINA":
          endpoint = `/becas/${id}/subtipo/disciplina`;
          datos = {
            id_disciplina: parseInt(datosSubtipo.id_disciplina),
          };
          break;
        case "DISCAPACIDAD":
          endpoint = `/becas/${id}/subtipo/discapacidad`;
          datos = {
            carnet_discapacidad: datosSubtipo.carnet_discapacidad,
            porcentaje_disc: parseInt(datosSubtipo.porcentaje_disc),
            tipo_disc: datosSubtipo.tipo_disc,
          };
          break;
        default:
          setError("Selecciona un subtipo");
          setGuardando(false);
          return;
      }

      await api.post(endpoint, datos);
      navigate("/becas");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear subtipo");
    } finally {
      setGuardando(false);
    }
  };

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

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/becas" className="text-blue-800 hover:underline text-sm">
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Agregar Subtipo</h1>
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
            {/* Info beca */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Beca</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Estudiante</p>
                  <p className="font-medium text-gray-800">
                    {beca.nombre_completo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo</p>
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
                  <p className="text-gray-500">Estado</p>
                  <p className="font-medium text-gray-800">
                    {beca.estado_beca}
                  </p>
                </div>
              </div>
            </div>

            {/* Selector subtipo */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Selecciona el subtipo
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {["PROMEDIO", "RESPONSABLE", "DISCIPLINA", "DISCAPACIDAD"].map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubtipo(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium
                      border-2 transition
                      ${
                        subtipo === s
                          ? "bg-blue-800 text-white border-blue-800"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>

              {/* Formulario según subtipo */}
              {subtipo && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {subtipo === "PROMEDIO" && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Promedio mantenido *
                        </label>
                        <input
                          type="number"
                          name="promedio_mantenido"
                          value={datosSubtipo.promedio_mantenido}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="85.5"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gestión obtenido *
                          </label>
                          <input
                            type="number"
                            name="gestion_obtenido"
                            value={datosSubtipo.gestion_obtenido}
                            onChange={handleChange}
                            placeholder="2023"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Semestre obtenido *
                          </label>
                          <input
                            type="number"
                            name="semestre_obtenido"
                            value={datosSubtipo.semestre_obtenido}
                            onChange={handleChange}
                            placeholder="2"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {subtipo === "RESPONSABLE" && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre responsable *
                        </label>
                        <input
                          type="text"
                          name="responsable_beca"
                          value={datosSubtipo.responsable_beca}
                          onChange={handleChange}
                          placeholder="Nombre del responsable"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Antigüedad (años)
                        </label>
                        <input
                          type="number"
                          name="antiguedad"
                          value={datosSubtipo.antiguedad}
                          onChange={handleChange}
                          placeholder="5"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl
                        border-2 cursor-pointer transition
                        ${
                          datosSubtipo.hor_completo
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                        onClick={() =>
                          setDatosSubtipo({
                            ...datosSubtipo,
                            hor_completo: !datosSubtipo.hor_completo,
                          })
                        }
                      >
                        <input
                          type="checkbox"
                          name="hor_completo"
                          checked={datosSubtipo.hor_completo}
                          onChange={handleChange}
                          className="w-4 h-4 accent-green-600"
                        />
                        <span className="text-sm text-gray-700">
                          Horario completo
                        </span>
                      </div>
                    </div>
                  )}

                  {subtipo === "DISCIPLINA" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disciplina *
                      </label>
                      <select
                        name="id_disciplina"
                        value={datosSubtipo.id_disciplina}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                          text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar disciplina...</option>
                        {disciplinas.map((d) => (
                          <option key={d.id_disciplina} value={d.id_disciplina}>
                            {d.nombre_disciplina}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {subtipo === "DISCAPACIDAD" && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carnet discapacidad
                        </label>
                        <input
                          type="text"
                          name="carnet_discapacidad"
                          value={datosSubtipo.carnet_discapacidad}
                          onChange={handleChange}
                          placeholder="DISC-001"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Porcentaje discapacidad *
                        </label>
                        <input
                          type="number"
                          name="porcentaje_disc"
                          value={datosSubtipo.porcentaje_disc}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          placeholder="30"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de discapacidad *
                        </label>
                        <input
                          type="text"
                          name="tipo_disc"
                          value={datosSubtipo.tipo_disc}
                          onChange={handleChange}
                          placeholder="Visual, motriz, auditiva..."
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                        px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      {guardando ? "Guardando..." : "Guardar subtipo"}
                    </button>
                    <Link
                      to="/becas"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700
                        font-medium px-6 py-2.5 rounded-lg transition"
                    >
                      Cancelar
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NuevoSubtipo;
