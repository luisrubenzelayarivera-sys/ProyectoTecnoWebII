import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getBeca, getDisciplinas } from "../../api/becas.api";
import api from "../../api/axios";
import SelectCustom from "../../components/SelectCustom";

const SUBTIPO_POR_NOMBRE = {
  "EXCELENCIA ACAD.":  "PROMEDIO",
  "INSTITUCIONAL":     "RESPONSABLE",
  "GRAN CANCILLER":    "RESPONSABLE",
  "OBISPO":            "RESPONSABLE",
  "RELIGIOSOS":        "RESPONSABLE",
  "FERRUFINO":         "RESPONSABLE",
  "HANSA":             "RESPONSABLE",
  "PATROCINIO":        "RESPONSABLE",
  "TRIUNFAR":          "RESPONSABLE",
  "COCA COLA":         "RESPONSABLE",
  "ESTRELLA DEL SUR":  "RESPONSABLE",
  "APORTE VOLUNTARIO": "RESPONSABLE",
  "APORTE DEPORTE":    "DISCIPLINA",
  "APORTE CULTURA":    "DISCIPLINA",
  "DISCAPACIDAD":      "DISCAPACIDAD",
  "COMUNIDAD/SOCIOECONOMICA": null,
  "RECTOR NACIONAL":          null,
  "BACHILLER":                null,
};

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const NuevoSubtipo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beca, setBeca] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
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
        const [resBeca, resDisc] = await Promise.all([getBeca(id), getDisciplinas()]);
        setBeca(resBeca.data);
        setDisciplinas(resDisc.data);
      } catch {
        setError("Error al cargar los datos de la beca.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const subtipo = beca ? (SUBTIPO_POR_NOMBRE[beca.nombre_beca] ?? null) : null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosSubtipo({ ...datosSubtipo, [name]: type === "checkbox" ? checked : value });
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
            responsable_beca: datosSubtipo.responsable_beca || null,
            hor_completo: datosSubtipo.hor_completo,
            antiguedad: datosSubtipo.antiguedad ? parseInt(datosSubtipo.antiguedad) : null,
          };
          break;
        case "DISCIPLINA":
          endpoint = `/becas/${id}/subtipo/disciplina`;
          datos = { id_disciplina: parseInt(datosSubtipo.id_disciplina) };
          break;
        case "DISCAPACIDAD":
          endpoint = `/becas/${id}/subtipo/discapacidad`;
          datos = {
            carnet_discapacidad: datosSubtipo.carnet_discapacidad || null,
            porcentaje_disc: parseInt(datosSubtipo.porcentaje_disc),
            tipo_disc: datosSubtipo.tipo_disc,
          };
          break;
        default:
          setError("Este tipo de beca no tiene datos adicionales para registrar.");
          setGuardando(false);
          return;
      }

      await api.post(endpoint, datos);
      navigate("/becas");
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar los datos adicionales.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <p className="text-slate-400 text-sm">Cargando datos de la beca...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link to="/becas" className="text-slate-500 hover:text-slate-700 transition">Becas</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium">Datos adicionales</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-6">Datos adicionales de beca</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {beca && (
          <div className="flex flex-col gap-5">
            {/* Resumen */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Beca seleccionada
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Estudiante</p>
                  <p className="font-medium text-slate-800">{beca.nombre_completo}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Tipo</p>
                  <p className="font-semibold text-blue-700">{beca.nombre_beca}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Porcentaje</p>
                  <p className="font-medium text-slate-800">{beca.porcentaje}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Estado</p>
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {beca.estado_beca}
                  </span>
                </div>
              </div>
            </div>

            {/* Sin subtipo aplicable */}
            {subtipo === null && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  La beca <strong>{beca.nombre_beca}</strong> no tiene datos adicionales de subtipo.
                  {(beca.nombre_beca === "COMUNIDAD/SOCIOECONOMICA" || beca.nombre_beca === "RECTOR NACIONAL") &&
                    " La asignación de área de trabajo se registra en el módulo Asignación."}
                  {beca.nombre_beca === "BACHILLER" &&
                    " Esta beca continua se gestiona en el módulo de Becas Continuas."}
                </span>
              </div>
            )}

            {/* Formulario del subtipo */}
            {subtipo && (
              <div className="bg-white rounded-xl border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  <h2 className="text-sm font-semibold text-blue-800">
                    {subtipo === "PROMEDIO"    && "Datos de excelencia académica"}
                    {subtipo === "RESPONSABLE" && "Datos del responsable / benefactor"}
                    {subtipo === "DISCIPLINA"  && "Datos de disciplina"}
                    {subtipo === "DISCAPACIDAD"&& "Datos de discapacidad"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {subtipo === "PROMEDIO" && (
                    <>
                      <FormField label="Promedio obtenido" required>
                        <input type="number" name="promedio_mantenido"
                          value={datosSubtipo.promedio_mantenido} onChange={handleChange}
                          min="0" max="100" step="0.01" placeholder="85.50" required className={inputCls} />
                      </FormField>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Gestión obtenida" required>
                          <input type="number" name="gestion_obtenido"
                            value={datosSubtipo.gestion_obtenido} onChange={handleChange}
                            placeholder="2023" required className={inputCls} />
                        </FormField>
                        <FormField label="Semestre obtenido" required>
                          <SelectCustom name="semestre_obtenido"
                            value={datosSubtipo.semestre_obtenido} onChange={handleChange}>
                            <option value="">Seleccionar...</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                          </SelectCustom>
                        </FormField>
                      </div>
                    </>
                  )}

                  {subtipo === "RESPONSABLE" && (
                    <>
                      <FormField label="Nombre del responsable">
                        <input type="text" name="responsable_beca"
                          value={datosSubtipo.responsable_beca} onChange={handleChange}
                          placeholder="Nombre completo" className={inputCls} />
                      </FormField>
                      <FormField label="Antigüedad (años)">
                        <input type="number" name="antiguedad"
                          value={datosSubtipo.antiguedad} onChange={handleChange}
                          min="0" placeholder="5" className={inputCls} />
                      </FormField>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" name="hor_completo"
                          checked={datosSubtipo.hor_completo} onChange={handleChange}
                          className="w-4 h-4 accent-blue-600 rounded" />
                        <span className="text-sm text-slate-700 font-medium">Horario completo</span>
                      </label>
                    </>
                  )}

                  {subtipo === "DISCIPLINA" && (
                    <FormField label="Disciplina" required>
                      <SelectCustom name="id_disciplina"
                        value={datosSubtipo.id_disciplina} onChange={handleChange}>
                        <option value="">Seleccione una disciplina...</option>
                        {disciplinas.map((d) => (
                          <option key={d.id_disciplina} value={d.id_disciplina}>
                            {d.nombre_disciplina}
                          </option>
                        ))}
                      </SelectCustom>
                    </FormField>
                  )}

                  {subtipo === "DISCAPACIDAD" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Carnet de discapacidad">
                          <input type="text" name="carnet_discapacidad"
                            value={datosSubtipo.carnet_discapacidad} onChange={handleChange}
                            placeholder="SENADIS-001" className={inputCls} />
                        </FormField>
                        <FormField label="Porcentaje (%)" required>
                          <input type="number" name="porcentaje_disc"
                            value={datosSubtipo.porcentaje_disc} onChange={handleChange}
                            min="0" max="100" placeholder="30" required className={inputCls} />
                        </FormField>
                      </div>
                      <FormField label="Tipo de discapacidad" required>
                        <input type="text" name="tipo_disc"
                          value={datosSubtipo.tipo_disc} onChange={handleChange}
                          placeholder="Visual, motriz, auditiva..." required className={inputCls} />
                      </FormField>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={guardando}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
                      {guardando ? "Guardando..." : "Guardar datos"}
                    </button>
                    <Link to="/becas"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-2.5 rounded-lg transition text-sm">
                      Cancelar
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {subtipo === null && (
              <Link to="/becas"
                className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition text-sm w-fit">
                Volver a becas
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NuevoSubtipo;
