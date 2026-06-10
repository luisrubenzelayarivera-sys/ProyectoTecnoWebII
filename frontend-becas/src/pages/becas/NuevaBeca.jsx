import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createBeca, getTiposBeca, getDisciplinas } from "../../api/becas.api";
import { getListaEstudiantes } from "../../api/estudiantes.api";
import SelectCustom from "../../components/SelectCustom";

const SUBTIPO_POR_TIPO = {
  PROMEDIO: "PROMEDIO",
  DISCIPLINA: "DISCIPLINA",
  DISCAPACIDAD: "DISCAPACIDAD",
  RESPONSABLE: "RESPONSABLE",
  "COMUNIDAD/SOCIOECONOMICA": null,
  "RECTOR NACIONAL": null,
};

const NuevaBeca = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposBeca, setTiposBeca] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    id_estudiante: "",
    id_tipo_beca: "",
    porcentaje: "",
    gestion: "",
    periodo: "",
    cod_doc_respaldo: "",
    declaracion_jurada: false,
    observaciones: "",
  });

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

  // Calcular subtipo activo DENTRO del componente
  const tipoSeleccionado = tiposBeca.find(
    (t) => t.id_tipo_beca === parseInt(form.id_tipo_beca),
  );
  const subtipoActivo = tipoSeleccionado
    ? (SUBTIPO_POR_TIPO[tipoSeleccionado.nombre_beca] ?? null)
    : null;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resEst, resTipos, resDisc] = await Promise.all([
          getListaEstudiantes(),
          getTiposBeca(),
          getDisciplinas(),
        ]);
        setEstudiantes(resEst.data);
        setTiposBeca(resTipos.data);
        setDisciplinas(resDisc.data);
      } catch (err) {
        setError("Error al cargar datos");
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubtipoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosSubtipo({
      ...datosSubtipo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const estudiantesFiltrados = estudiantes.filter(
    (e) =>
      e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.carnet && e.carnet.includes(busqueda)),
  );

  const estudianteSeleccionado = estudiantes.find(
    (e) => e.id_estudiante === form.id_estudiante,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const datos = {
        id_estudiante: form.id_estudiante,
        id_tipo_beca: parseInt(form.id_tipo_beca),
        porcentaje: parseFloat(form.porcentaje),
        gestion: parseInt(form.gestion),
        periodo: parseInt(form.periodo),
        cod_doc_respaldo: form.cod_doc_respaldo || null,
        declaracion_jurada: form.declaracion_jurada,
        observaciones: form.observaciones || null,
        subtipo: subtipoActivo,
        datos_subtipo: subtipoActivo ? datosSubtipo : null,
      };

      await createBeca(datos);
      navigate("/becas");
    } catch (err) {
      const msg =
        err.response?.data?.errores?.[0]?.msg ||
        err.response?.data?.error ||
        "Error al crear beca";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/becas" className="text-blue-800 hover:underline text-sm">
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Beca</h1>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Buscador de estudiante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar estudiante *
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o carnet..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {busqueda && !form.id_estudiante && (
                <div
                  className="border border-gray-200 rounded-lg mt-1
                  max-h-48 overflow-y-auto shadow-sm"
                >
                  {estudiantesFiltrados.length === 0 ? (
                    <p className="text-gray-400 text-sm px-4 py-3">
                      No se encontraron estudiantes
                    </p>
                  ) : (
                    estudiantesFiltrados.map((e) => (
                      <button
                        key={e.id_estudiante}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, id_estudiante: e.id_estudiante });
                          setBusqueda(e.nombre_completo);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50
                          text-sm border-b border-gray-100 last:border-0 transition"
                      >
                        <span className="font-medium text-gray-800">
                          {e.nombre_completo}
                        </span>
                        {e.carnet && (
                          <span className="text-gray-400 ml-2">
                            CI: {e.carnet}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
              {estudianteSeleccionado && (
                <div
                  className="mt-2 bg-blue-50 border border-blue-200
                  rounded-lg px-4 py-2 text-sm text-blue-800 flex justify-between"
                >
                  <span>✓ {estudianteSeleccionado.nombre_completo}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, id_estudiante: "" });
                      setBusqueda("");
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Tipo de beca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de beca *
              </label>
              <SelectCustom
                name="id_tipo_beca"
                value={form.id_tipo_beca}
                onChange={handleChange}
              >
                <option value="">Seleccionar tipo...</option>
                {tiposBeca.map((t) => (
                  <option key={t.id_tipo_beca} value={t.id_tipo_beca}>
                    {t.nombre_beca}
                  </option>
                ))}
              </SelectCustom>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje (0-100) *
                </label>
                <input
                  type="number"
                  name="porcentaje"
                  value={form.porcentaje}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="50.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código documento
                </label>
                <input
                  type="text"
                  name="cod_doc_respaldo"
                  value={form.cod_doc_respaldo}
                  onChange={handleChange}
                  placeholder="DOC-001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gestión *
                </label>
                <input
                  type="number"
                  name="gestion"
                  value={form.gestion}
                  onChange={handleChange}
                  required
                  placeholder="2024"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periodo *
                </label>
                <SelectCustom
                  name="periodo"
                  value={form.periodo}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="1">Periodo 1</option>
                  <option value="2">Periodo 2</option>
                </SelectCustom>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones adicionales..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl
                border-2 cursor-pointer transition
                ${
                  form.declaracion_jurada
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              onClick={() =>
                setForm({
                  ...form,
                  declaracion_jurada: !form.declaracion_jurada,
                })
              }
            >
              <input
                type="checkbox"
                name="declaracion_jurada"
                checked={form.declaracion_jurada}
                onChange={handleChange}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Declaración jurada firmada
              </span>
            </div>

            {/* Campos dinámicos según tipo de beca */}
            {subtipoActivo === "PROMEDIO" && (
              <div
                className="border border-blue-200 rounded-xl p-4 bg-blue-50
                flex flex-col gap-4"
              >
                <p className="text-sm font-semibold text-blue-800">
                  📊 Datos de beca por Promedio
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Promedio mantenido *
                    </label>
                    <input
                      type="number"
                      name="promedio_mantenido"
                      value={datosSubtipo.promedio_mantenido}
                      onChange={handleSubtipoChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="85.5"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gestión obtenido *
                    </label>
                    <input
                      type="number"
                      name="gestion_obtenido"
                      value={datosSubtipo.gestion_obtenido}
                      onChange={handleSubtipoChange}
                      placeholder="2023"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Semestre obtenido *
                    </label>
                    <input
                      type="number"
                      name="semestre_obtenido"
                      value={datosSubtipo.semestre_obtenido}
                      onChange={handleSubtipoChange}
                      placeholder="2"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {subtipoActivo === "RESPONSABLE" && (
              <div
                className="border border-blue-200 rounded-xl p-4 bg-blue-50
                flex flex-col gap-4"
              >
                <p className="text-sm font-semibold text-blue-800">
                  👤 Datos de beca por Responsable
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre responsable *
                    </label>
                    <input
                      type="text"
                      name="responsable_beca"
                      value={datosSubtipo.responsable_beca}
                      onChange={handleSubtipoChange}
                      placeholder="Nombre del responsable"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Antigüedad (años)
                    </label>
                    <input
                      type="number"
                      name="antiguedad"
                      value={datosSubtipo.antiguedad}
                      onChange={handleSubtipoChange}
                      placeholder="5"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg
                    border cursor-pointer transition
                    ${
                      datosSubtipo.hor_completo
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-gray-200"
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
                    onChange={handleSubtipoChange}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-sm text-gray-700">
                    Horario completo
                  </span>
                </div>
              </div>
            )}

            {subtipoActivo === "DISCIPLINA" && (
              <div
                className="border border-blue-200 rounded-xl p-4 bg-blue-50
                flex flex-col gap-4"
              >
                <p className="text-sm font-semibold text-blue-800">
                  🏅 Datos de beca por Disciplina
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Disciplina *
                  </label>
                  <select
                    name="id_disciplina"
                    value={datosSubtipo.id_disciplina}
                    onChange={handleSubtipoChange}
                    className="w-full appearance-none bg-white border border-gray-200
                      rounded-xl px-4 py-2.5 text-sm focus:outline-none
                      focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar disciplina...</option>
                    {disciplinas.map((d) => (
                      <option key={d.id_disciplina} value={d.id_disciplina}>
                        {d.nombre_disciplina}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {subtipoActivo === "DISCAPACIDAD" && (
              <div
                className="border border-blue-200 rounded-xl p-4 bg-blue-50
                flex flex-col gap-4"
              >
                <p className="text-sm font-semibold text-blue-800">
                  ♿ Datos de beca por Discapacidad
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Carnet discapacidad
                    </label>
                    <input
                      type="text"
                      name="carnet_discapacidad"
                      value={datosSubtipo.carnet_discapacidad}
                      onChange={handleSubtipoChange}
                      placeholder="DISC-001"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Porcentaje discapacidad *
                    </label>
                    <input
                      type="number"
                      name="porcentaje_disc"
                      value={datosSubtipo.porcentaje_disc}
                      onChange={handleSubtipoChange}
                      min="0"
                      max="100"
                      placeholder="30"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de discapacidad *
                  </label>
                  <input
                    type="text"
                    name="tipo_disc"
                    value={datosSubtipo.tipo_disc}
                    onChange={handleSubtipoChange}
                    placeholder="Visual, motriz, auditiva..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Mensaje para tipos sin datos extra */}
            {form.id_tipo_beca && subtipoActivo === null && (
              <div
                className="bg-gray-50 border border-gray-200 rounded-xl
                px-4 py-3 text-sm text-gray-500 flex items-center gap-2"
              >
                <span>✅</span>
                <span>Este tipo de beca no requiere datos adicionales.</span>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={cargando || !form.id_estudiante}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                  px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {cargando ? "Guardando..." : "Guardar beca"}
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
        </div>
      </div>
    </div>
  );
};

export default NuevaBeca;
