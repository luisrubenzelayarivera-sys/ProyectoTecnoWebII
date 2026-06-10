import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  createBeca, getTiposBeca, getDisciplinas,
  getCategoriasBeca, createBecaContinua,
} from "../../api/becas.api";
import { getListaEstudiantes } from "../../api/estudiantes.api";
import SelectCustom from "../../components/SelectCustom";
import ModalNuevoEstudiante from "../../components/ModalNuevoEstudiante";

/**
 * MAPEO DEFINITIVO — basado en el schema real de Base_Becas.sql
 *
 * "PROMEDIO"    → becas_promedio     (promedio_mantenido, gestion_obtenido, semestre_obtenido)
 * "RESPONSABLE" → becas_responsable  (responsable_beca, hor_completo, antiguedad)
 * "DISCIPLINA"  → becas_disciplina   (id_disciplina)
 * "DISCAPACIDAD"→ becas_discapacidad (carnet_discapacidad, porcentaje_disc, tipo_disc)
 * "BACHILLER"   → beca_cont_semestre + becas_continuas (flujo propio post-creación)
 * null          → solo registro base en becas (COMUNIDAD, RECTOR y genéricas sin datos extra)
 */
const SUBTIPO_POR_NOMBRE = {
  // ── Promedio académico ────────────────────────────────────────────
  "EXCELENCIA ACAD.":   "PROMEDIO",

  // ── Responsable / benefactor ──────────────────────────────────────
  "INSTITUCIONAL":      "RESPONSABLE",
  "GRAN CANCILLER":     "RESPONSABLE",
  "OBISPO":             "RESPONSABLE",
  "RELIGIOSOS":         "RESPONSABLE",
  "FERRUFINO":          "RESPONSABLE",
  "HANSA":              "RESPONSABLE",
  "PATROCINIO":         "RESPONSABLE",
  "TRIUNFAR":           "RESPONSABLE",

  // ── Disciplina deportiva / cultural ──────────────────────────────
  "APORTE DEPORTE":     "DISCIPLINA",
  "APORTE CULTURA":     "DISCIPLINA",

  // ── Discapacidad ─────────────────────────────────────────────────
  "DISCAPACIDAD":       "DISCAPACIDAD",

  // ── Beca continua (flujo separado post-creación) ─────────────────
  "BACHILLER":          "BACHILLER",

  // ── Sin subtipo de datos extra (solo registro base) ──────────────
  // Becas de servicio → permiten asignación de área (módulo Asignación)
  "COMUNIDAD/SOCIOECONOMICA": null,
  "RECTOR NACIONAL":          null,
  // Genéricas sin responsable ni datos extra
  "COCA COLA":          null,
  "ESTRELLA DEL SUR":   null,
  "APORTE VOLUNTARIO":  null,
};

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";

const FormField = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

const SectionCard = ({ color = "blue", title, children }) => (
  <div className={`bg-white rounded-xl border border-${color}-200 p-6`}>
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-1 h-5 bg-${color}-500 rounded-full`} />
      <h2 className={`text-sm font-semibold text-${color}-800`}>{title}</h2>
    </div>
    {children}
  </div>
);

// ── Paso 2: datos de beca continua BACHILLER ────────────────────────
const SeccionBachiller = ({ categorias, datos, onChange }) => (
  <SectionCard color="violet" title="Datos de beca continua (Bachiller)">
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Categoría">
          <SelectCustom name="id_categoria" value={datos.id_categoria} onChange={onChange}>
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
            ))}
          </SelectCustom>
        </FormField>
        <FormField label="Semestres otorgados" required>
          <input type="number" name="semestres_otorgados" value={datos.semestres_otorgados}
            onChange={onChange} min="1" max="20" placeholder="4" className={inputCls} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Gestión inicio">
          <input type="number" name="gestion_inicio" value={datos.gestion_inicio}
            onChange={onChange} placeholder="2024" className={inputCls} />
        </FormField>
        <FormField label="Periodo inicio">
          <SelectCustom name="periodo_inicio" value={datos.periodo_inicio} onChange={onChange}>
            <option value="">Seleccionar...</option>
            <option value="1">Periodo I</option>
            <option value="2">Periodo II</option>
          </SelectCustom>
        </FormField>
      </div>
      <FormField label="Responsable">
        <input type="text" name="responsable" value={datos.responsable}
          onChange={onChange} placeholder="Nombre del responsable" className={inputCls} />
      </FormField>
    </div>
  </SectionCard>
);

const NuevaBeca = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estudiantePrefill = searchParams.get("estudiante");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposBeca, setTiposBeca] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [modalEstudiante, setModalEstudiante] = useState(false);

  const [form, setForm] = useState({
    id_estudiante: estudiantePrefill || "",
    id_tipo_beca: "",
    porcentaje: "",
    gestion: new Date().getFullYear(),
    periodo: "",
    cod_doc_respaldo: "",
    declaracion_jurada: false,
    observaciones: "",
  });

  const [datosSubtipo, setDatosSubtipo] = useState({
    promedio_mantenido: "", gestion_obtenido: "", semestre_obtenido: "",
    responsable_beca: "", hor_completo: false, antiguedad: "",
    id_disciplina: "",
    carnet_discapacidad: "", porcentaje_disc: "", tipo_disc: "",
  });

  const [datosBachiller, setDatosBachiller] = useState({
    id_categoria: "", semestres_otorgados: "", gestion_inicio: "",
    periodo_inicio: "", responsable: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resEst, resTipos, resDisc, resCat] = await Promise.all([
          getListaEstudiantes(), getTiposBeca(), getDisciplinas(), getCategoriasBeca(),
        ]);
        setEstudiantes(resEst.data);
        setTiposBeca(resTipos.data);
        setDisciplinas(resDisc.data);
        setCategorias(resCat.data);

        // Pre-seleccionar estudiante si viene por query param
        if (estudiantePrefill) {
          const est = resEst.data.find(e => e.id_estudiante === estudiantePrefill);
          if (est) setBusqueda(est.nombre_completo);
        }
      } catch {
        setError("Error al cargar datos iniciales.");
      }
    };
    cargar();
  }, [estudiantePrefill]);

  const tipoSel = tiposBeca.find(t => t.id_tipo_beca === parseInt(form.id_tipo_beca));
  const subtipo = tipoSel ? (SUBTIPO_POR_NOMBRE[tipoSel.nombre_beca] ?? null) : undefined;
  const esBecaServicio = tipoSel?.nombre_beca === "COMUNIDAD/SOCIOECONOMICA" || tipoSel?.nombre_beca === "RECTOR NACIONAL";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "id_tipo_beca") {
      setDatosSubtipo({ promedio_mantenido: "", gestion_obtenido: "", semestre_obtenido: "", responsable_beca: "", hor_completo: false, antiguedad: "", id_disciplina: "", carnet_discapacidad: "", porcentaje_disc: "", tipo_disc: "" });
      setDatosBachiller({ id_categoria: "", semestres_otorgados: "", gestion_inicio: "", periodo_inicio: "", responsable: "" });
    }
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const estudiantesFiltrados = mostrarLista
    ? estudiantes.filter(e =>
        e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.carnet && e.carnet.includes(busqueda))
      )
    : [];

  const estudianteSeleccionado = estudiantes.find(e => e.id_estudiante === form.id_estudiante);

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
      };

      // Agregar subtipo solo cuando aplica (excluyendo BACHILLER que tiene flujo propio)
      if (subtipo && subtipo !== "BACHILLER") {
        datos.subtipo = subtipo;
        datos.datos_subtipo = datosSubtipo;
      }

      const res = await createBeca(datos);
      const nuevaBecaId = res.data.id_beca;

      // Para BACHILLER, crear la beca continua vinculada
      if (subtipo === "BACHILLER" && datosBachiller.semestres_otorgados) {
        await createBecaContinua(nuevaBecaId, {
          id_categoria: datosBachiller.id_categoria ? parseInt(datosBachiller.id_categoria) : null,
          semestres_otorgados: parseInt(datosBachiller.semestres_otorgados),
          gestion_inicio: datosBachiller.gestion_inicio ? parseInt(datosBachiller.gestion_inicio) : null,
          periodo_inicio: datosBachiller.periodo_inicio ? parseInt(datosBachiller.periodo_inicio) : null,
          responsable: datosBachiller.responsable || null,
        });
      }

      navigate("/becas");
    } catch (err) {
      const msg = err.response?.data?.errores?.[0]?.msg || err.response?.data?.error || "Error al registrar la beca.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link to="/becas" className="text-slate-500 hover:text-slate-700 transition">Becas</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium">Nueva beca</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-6">Registrar nueva beca</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Estudiante ── */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estudiante</h2>
              <button type="button" onClick={() => setModalEstudiante(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear nuevo
              </button>
            </div>

            {estudianteSeleccionado ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{estudianteSeleccionado.nombre_completo}</span>
                  {estudianteSeleccionado.carnet && <span className="text-blue-500 text-xs">CI: {estudianteSeleccionado.carnet}</span>}
                </div>
                <button type="button" onClick={() => { setForm({ ...form, id_estudiante: "" }); setBusqueda(""); setMostrarLista(false); }}
                  className="text-blue-400 hover:text-blue-600 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <FormField label="Buscar estudiante" required>
                <input type="text" value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setMostrarLista(true); }}
                  placeholder="Nombre completo o número de carnet..."
                  className={inputCls} />
                {mostrarLista && busqueda && (
                  <div className="border border-slate-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-sm bg-white">
                    {estudiantesFiltrados.length === 0 ? (
                      <p className="text-slate-400 text-sm px-4 py-3">Sin resultados</p>
                    ) : (
                      estudiantesFiltrados.map((e) => (
                        <button key={e.id_estudiante} type="button"
                          onClick={() => { setForm({ ...form, id_estudiante: e.id_estudiante }); setBusqueda(e.nombre_completo); setMostrarLista(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-slate-100 last:border-0 transition">
                          <span className="font-medium text-slate-800">{e.nombre_completo}</span>
                          {e.carnet && <span className="text-slate-400 ml-2 text-xs">CI: {e.carnet}</span>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </FormField>
            )}
          </div>

          {/* ── Datos base ── */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Datos de la beca</h2>
            <div className="flex flex-col gap-4">
              <FormField label="Tipo de beca" required>
                <SelectCustom name="id_tipo_beca" value={form.id_tipo_beca} onChange={handleChange}>
                  <option value="">Seleccione un tipo...</option>
                  {tiposBeca.map((t) => (
                    <option key={t.id_tipo_beca} value={t.id_tipo_beca}>{t.nombre_beca}</option>
                  ))}
                </SelectCustom>
                {tipoSel && (
                  <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {subtipo === "PROMEDIO"    && "Requiere promedio académico"}
                    {subtipo === "RESPONSABLE" && "Requiere datos del responsable"}
                    {subtipo === "DISCIPLINA"  && "Requiere selección de disciplina"}
                    {subtipo === "DISCAPACIDAD"&& "Requiere datos de discapacidad"}
                    {subtipo === "BACHILLER"   && "Requiere datos de beca continua"}
                    {subtipo === null && esBecaServicio && "Permite asignación de área de trabajo"}
                    {subtipo === null && !esBecaServicio && "Sin datos adicionales"}
                  </p>
                )}
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Porcentaje (%)" required>
                  <input type="number" name="porcentaje" value={form.porcentaje} onChange={handleChange}
                    required min="0" max="100" step="0.01" placeholder="50.00" className={inputCls} />
                </FormField>
                <FormField label="Código de documento">
                  <input type="text" name="cod_doc_respaldo" value={form.cod_doc_respaldo} onChange={handleChange}
                    placeholder="DOC-2024-001" className={inputCls} />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Gestión" required>
                  <input type="number" name="gestion" value={form.gestion} onChange={handleChange}
                    required placeholder="2024" className={inputCls} />
                </FormField>
                <FormField label="Periodo" required>
                  <SelectCustom name="periodo" value={form.periodo} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="1">Periodo I</option>
                    <option value="2">Periodo II</option>
                  </SelectCustom>
                </FormField>
              </div>

              <FormField label="Observaciones">
                <textarea name="observaciones" value={form.observaciones} onChange={handleChange}
                  rows={2} placeholder="Observaciones adicionales..." className={inputCls} />
              </FormField>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" name="declaracion_jurada" checked={form.declaracion_jurada}
                  onChange={handleChange} className="w-4 h-4 accent-blue-600 rounded" />
                <span className="text-sm text-slate-700 font-medium">Declaración jurada firmada</span>
              </label>
            </div>
          </div>

          {/* ── Subtipo: PROMEDIO ── */}
          {subtipo === "PROMEDIO" && (
            <SectionCard color="blue" title="Datos de excelencia académica">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Promedio obtenido" required>
                  <input type="number" name="promedio_mantenido" value={datosSubtipo.promedio_mantenido}
                    onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                    min="0" max="100" step="0.01" placeholder="85.50" className={inputCls} />
                </FormField>
                <FormField label="Gestión" required>
                  <input type="number" name="gestion_obtenido" value={datosSubtipo.gestion_obtenido}
                    onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                    placeholder="2023" className={inputCls} />
                </FormField>
                <FormField label="Semestre" required>
                  <SelectCustom name="semestre_obtenido" value={datosSubtipo.semestre_obtenido}
                    onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}>
                    <option value="">Sel...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </SelectCustom>
                </FormField>
              </div>
            </SectionCard>
          )}

          {/* ── Subtipo: RESPONSABLE ── */}
          {subtipo === "RESPONSABLE" && (
            <SectionCard color="blue" title="Datos del responsable / benefactor">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nombre del responsable">
                    <input type="text" name="responsable_beca" value={datosSubtipo.responsable_beca}
                      onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                      placeholder="Nombre completo" className={inputCls} />
                  </FormField>
                  <FormField label="Antigüedad (años)">
                    <input type="number" name="antiguedad" value={datosSubtipo.antiguedad}
                      onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                      min="0" placeholder="5" className={inputCls} />
                  </FormField>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" name="hor_completo" checked={datosSubtipo.hor_completo}
                    onChange={e => setDatosSubtipo({ ...datosSubtipo, hor_completo: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm text-slate-700 font-medium">Horario completo</span>
                </label>
              </div>
            </SectionCard>
          )}

          {/* ── Subtipo: DISCIPLINA ── */}
          {subtipo === "DISCIPLINA" && (
            <SectionCard color="blue" title="Datos de disciplina">
              <FormField label="Disciplina" required>
                <SelectCustom name="id_disciplina" value={datosSubtipo.id_disciplina}
                  onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}>
                  <option value="">Seleccione una disciplina...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre_disciplina}</option>
                  ))}
                </SelectCustom>
              </FormField>
            </SectionCard>
          )}

          {/* ── Subtipo: DISCAPACIDAD ── */}
          {subtipo === "DISCAPACIDAD" && (
            <SectionCard color="blue" title="Datos de discapacidad">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Carnet de discapacidad">
                    <input type="text" name="carnet_discapacidad" value={datosSubtipo.carnet_discapacidad}
                      onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                      placeholder="SENADIS-001" className={inputCls} />
                  </FormField>
                  <FormField label="Porcentaje (%)" required>
                    <input type="number" name="porcentaje_disc" value={datosSubtipo.porcentaje_disc}
                      onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                      min="0" max="100" placeholder="30" className={inputCls} />
                  </FormField>
                </div>
                <FormField label="Tipo de discapacidad" required>
                  <input type="text" name="tipo_disc" value={datosSubtipo.tipo_disc}
                    onChange={e => setDatosSubtipo({ ...datosSubtipo, [e.target.name]: e.target.value })}
                    placeholder="Visual, motriz, auditiva..." className={inputCls} />
                </FormField>
              </div>
            </SectionCard>
          )}

          {/* ── Subtipo: BACHILLER (beca continua) ── */}
          {subtipo === "BACHILLER" && (
            <SeccionBachiller
              categorias={categorias}
              datos={datosBachiller}
              onChange={e => setDatosBachiller({ ...datosBachiller, [e.target.name]: e.target.value })}
            />
          )}

          {/* ── Aviso becas de servicio ── */}
          {esBecaServicio && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Las becas <strong>{tipoSel?.nombre_beca}</strong> pueden tener asignación de área
                de trabajo y evaluación de desempeño. Una vez creada, regístrela en el módulo{" "}
                <strong>Asignación</strong>.
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit"
              disabled={cargando || !form.id_estudiante || !form.id_tipo_beca}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {cargando ? "Guardando..." : "Registrar beca"}
            </button>
            <Link to="/becas"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-2.5 rounded-lg transition text-sm">
              Cancelar
            </Link>
          </div>
        </form>

        <ModalNuevoEstudiante
          isOpen={modalEstudiante}
          onClose={() => setModalEstudiante(false)}
          onEstudianteCreado={(est) => {
            setEstudiantes([...estudiantes, est]);
            setForm({ ...form, id_estudiante: est.id_estudiante });
            setBusqueda(est.nombre_completo);
            setMostrarLista(false);
          }}
        />
      </div>
    </div>
  );
};

export default NuevaBeca;
