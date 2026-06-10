import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  getEstudiante, updateEstudiante, deleteEstudiante,
  getCarreras, cambiarCarrera,
} from "../../api/estudiantes.api";
import { getBecasPorEstudiante, updateEstadoBeca, deleteBeca } from "../../api/becas.api";
import SelectCustom from "../../components/SelectCustom";

// ── Helpers ─────────────────────────────────────────────────────────
const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";

const badgeEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":     return "bg-emerald-100 text-emerald-800";
    case "SUSPENDIDA": return "bg-amber-100 text-amber-800";
    case "FINALIZADA": return "bg-slate-100 text-slate-600";
    case "ABANDONADA": return "bg-red-100 text-red-700";
    default:           return "bg-blue-100 text-blue-800";
  }
};

const ESTADOS_BECA = ["ACTIVA", "SUSPENDIDA", "FINALIZADA", "ABANDONADA"];

// ── Sección de datos del subtipo ────────────────────────────────────
const SubtipoInfo = ({ beca }) => {
  const filas = [];
  if (beca.promedio_mantenido != null) {
    filas.push(["Promedio", `${beca.promedio_mantenido}`]);
    filas.push(["Gestión/Sem.", `${beca.gestion_obtenido} / ${beca.semestre_obtenido}`]);
  }
  if (beca.responsable_beca != null) {
    filas.push(["Responsable", beca.responsable_beca]);
    if (beca.antiguedad != null) filas.push(["Antigüedad", `${beca.antiguedad} años`]);
    filas.push(["Hor. completo", beca.hor_completo ? "Sí" : "No"]);
  }
  if (beca.nombre_disciplina != null) filas.push(["Disciplina", beca.nombre_disciplina]);
  if (beca.tipo_disc != null) {
    filas.push(["Tipo disc.", beca.tipo_disc]);
    if (beca.porcentaje_disc != null) filas.push(["% disc.", `${beca.porcentaje_disc}%`]);
    if (beca.carnet_discapacidad) filas.push(["Carnet disc.", beca.carnet_discapacidad]);
  }
  if (beca.nombre_categoria != null) {
    filas.push(["Categoría", beca.nombre_categoria]);
    if (beca.semestres_otorgados) filas.push(["Semestres", `${beca.semestres_consumidos ?? 0} / ${beca.semestres_otorgados}`]);
    if (beca.resp_continua) filas.push(["Responsable", beca.resp_continua]);
  }
  if (filas.length === 0) return null;
  return (
    <div className="mt-2 pt-2 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Datos adicionales</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {filas.map(([k, v]) => (
          <div key={k}>
            <span className="text-xs text-slate-400">{k}: </span>
            <span className="text-xs font-medium text-slate-700">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Card de beca en el historial ────────────────────────────────────
const BecaCard = ({ beca, onCambiarEstado, onEliminar }) => {
  const [expandida, setExpandida] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpandida(!expandida)}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${badgeEstado(beca.estado_beca)}`}>
            {beca.estado_beca}
          </span>
          <span className="font-medium text-slate-800 text-sm truncate">{beca.nombre_beca}</span>
          <span className="text-slate-400 text-xs shrink-0">
            {beca.porcentaje}% · {beca.gestion}/{beca.periodo === 1 ? "I" : "II"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button type="button" onClick={e => { e.stopPropagation(); onCambiarEstado(beca); }} title="Cambiar estado"
            className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button type="button" onClick={e => { e.stopPropagation(); onEliminar(beca); }} title="Deshabilitar"
            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandida ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expandida && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50">
          <div className="pt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {beca.cod_doc_respaldo && <div><span className="text-slate-400">Doc: </span><span className="font-medium text-slate-700">{beca.cod_doc_respaldo}</span></div>}
            <div><span className="text-slate-400">Decl. jurada: </span><span className="font-medium text-slate-700">{beca.declaracion_jurada ? "Sí" : "No"}</span></div>
            {beca.observaciones && <div className="col-span-2"><span className="text-slate-400">Obs: </span><span className="text-slate-600">{beca.observaciones}</span></div>}
          </div>

          <SubtipoInfo beca={beca} />

          <div className="mt-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Asignación</p>
            {beca.id_asignacion ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                <div><span className="text-slate-400">Área: </span><span className="font-medium text-slate-700">{beca.nombre_area}</span></div>
                {beca.ubicacion_campus && <div><span className="text-slate-400">Lugar: </span><span className="text-slate-600">{beca.ubicacion_campus}</span></div>}
                <div><span className="text-slate-400">Horas/sem: </span><span className="font-medium text-slate-700">{beca.horas_semana}</span></div>
              </div>
            ) : <p className="text-xs text-slate-400 italic">Sin asignación registrada</p>}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Evaluación</p>
            {beca.puntaje_desempeno != null ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Puntaje: </span>
                  <div className="flex items-center gap-1">
                    <div className="w-14 bg-slate-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${beca.puntaje_desempeno >= 75 ? "bg-emerald-500" : beca.puntaje_desempeno >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${beca.puntaje_desempeno}%` }} />
                    </div>
                    <span className="font-bold text-slate-700">{beca.puntaje_desempeno}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Continuidad: </span>
                  <span className={`px-1.5 py-0.5 rounded-full font-medium ${beca.recomienda_continuidad ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {beca.recomienda_continuidad ? "Sí" : "No"}
                  </span>
                </div>
                {beca.comentario_jefe_area && <div className="col-span-2"><span className="text-slate-400">Comentario: </span>{beca.comentario_jefe_area}</div>}
              </div>
            ) : <p className="text-xs text-slate-400 italic">Sin evaluación registrada</p>}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100">
            <Link to={`/becas/${beca.id_beca}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">
              Ver detalle completo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Modal cambiar estado ────────────────────────────────────────────
const ModalEstado = ({ beca, onClose, onGuardado }) => {
  const [estadoSel, setEstadoSel] = useState(beca.estado_beca);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setGuardando(true);
    try { await updateEstadoBeca(beca.id_beca, estadoSel); onGuardado(); }
    catch (err) { setError(err.response?.data?.error || "Error"); setGuardando(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Cambiar estado — {beca.nombre_beca}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
          {error && <p className="text-red-600 text-xs">{error}</p>}
          {ESTADOS_BECA.map((e) => (
            <label key={e} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition text-sm font-medium
              ${estadoSel === e ? badgeEstado(e) + " border-current" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <input type="radio" value={e} checked={estadoSel === e} onChange={() => setEstadoSel(e)} className="accent-blue-600" />
              {e}
            </label>
          ))}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={guardando}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Página principal ────────────────────────────────────────────────
const DetalleEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [becas, setBecas] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cargandoBecas, setCargandoBecas] = useState(false);
  const [modalEstado, setModalEstado] = useState(null);
  const [tab, setTab] = useState("datos");
  const [estudianteData, setEstudianteData] = useState(null);

  const [form, setForm] = useState({ nombre_completo: "", carnet: "", email_ucb: "", telefono: "" });
  const [formCarrera, setFormCarrera] = useState({ id_carrera: "", semestre_inicio: "" });
  const [guardandoCarrera, setGuardandoCarrera] = useState(false);

  const flash = (msg) => { setExito(msg); setTimeout(() => setExito(""), 3000); };

  const cargarEstudiante = async () => {
    try {
      const res = await getEstudiante(id);
      const e = res.data;
      setEstudianteData(e);
      setForm({ nombre_completo: e.nombre_completo || "", carnet: e.carnet || "", email_ucb: e.email_ucb || "", telefono: e.telefono || "" });
      setFormCarrera({ id_carrera: e.id_carrera || "", semestre_inicio: e.semestre_inicio || "" });
    } catch { setError("Estudiante no encontrado."); }
    finally { setCargando(false); }
  };

  const cargarBecas = async () => {
    setCargandoBecas(true);
    try { const res = await getBecasPorEstudiante(id); setBecas(res.data); }
    catch { /* no crítico */ }
    finally { setCargandoBecas(false); }
  };

  useEffect(() => {
    cargarEstudiante();
    cargarBecas();
    getCarreras().then(r => setCarreras(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setGuardando(true);
    try {
      await updateEstudiante(id, { nombre_completo: form.nombre_completo, carnet: form.carnet || null, email_ucb: form.email_ucb || null, telefono: form.telefono || null });
      flash("Datos actualizados correctamente.");
    } catch (err) {
      setError(err.response?.data?.errores?.[0]?.msg || err.response?.data?.error || "Error al actualizar.");
    } finally { setGuardando(false); }
  };

  const handleCarreraSubmit = async (e) => {
    e.preventDefault(); setError(""); setGuardandoCarrera(true);
    try {
      await cambiarCarrera(id, { id_carrera: parseInt(formCarrera.id_carrera), semestre_inicio: formCarrera.semestre_inicio || null });
      flash("Carrera actualizada correctamente.");
      cargarEstudiante();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar carrera.");
    } finally { setGuardandoCarrera(false); }
  };

  const handleEliminarEstudiante = async () => {
    if (!window.confirm("¿Confirma deshabilitar este estudiante?")) return;
    try { await deleteEstudiante(id); navigate("/estudiantes"); }
    catch { setError("No se pudo deshabilitar el estudiante."); }
  };

  const handleEliminarBeca = async (beca) => {
    if (!window.confirm(`¿Deshabilitar la beca "${beca.nombre_beca}"?`)) return;
    try { await deleteBeca(beca.id_beca); cargarBecas(); }
    catch (err) { setError(err.response?.data?.error || "No se pudo deshabilitar la beca."); }
  };

  if (cargando)
    return (
      <div className="min-h-screen bg-slate-50"><Navbar />
        <div className="flex items-center justify-center mt-20"><p className="text-slate-400 text-sm">Cargando...</p></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {modalEstado && <ModalEstado beca={modalEstado} onClose={() => setModalEstado(null)} onGuardado={() => { setModalEstado(null); cargarBecas(); }} />}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link to="/estudiantes" className="text-slate-500 hover:text-slate-700 transition">Estudiantes</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium truncate">{form.nombre_completo}</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{form.nombre_completo}</h1>
            {form.carnet && <p className="text-slate-500 text-sm mt-0.5">CI: {form.carnet}</p>}
            {estudianteData?.nombre_carrera && (
              <p className="text-slate-400 text-xs mt-0.5">{estudianteData.nombre_carrera}</p>
            )}
          </div>
          <button onClick={handleEliminarEstudiante}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition border border-red-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Deshabilitar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {exito && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {exito}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-slate-200">
          {[
            { key: "datos",   label: "Datos personales" },
            { key: "carrera", label: "Carrera" },
            { key: "becas",   label: `Becas${becas.length ? ` (${becas.length})` : ""}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px
                ${tab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB DATOS ── */}
        {tab === "datos" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo <span className="text-red-500">*</span></label>
                <input type="text" name="nombre_completo" value={form.nombre_completo}
                  onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Carnet de identidad</label>
                  <input type="text" name="carnet" value={form.carnet}
                    onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} placeholder="12345678" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                  <input type="text" name="telefono" value={form.telefono}
                    onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} placeholder="70000000" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo UCB</label>
                <input type="email" name="email_ucb" value={form.email_ucb}
                  onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} placeholder="nombre@ucb.edu.bo" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
                <Link to="/estudiantes" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-2.5 rounded-lg transition text-sm">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB CARRERA ── */}
        {tab === "carrera" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {estudianteData?.nombre_carrera && (
              <div className="mb-5 pb-4 border-b border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Carrera actual</p>
                <p className="font-semibold text-slate-800">{estudianteData.nombre_carrera}</p>
                {estudianteData.semestre_inicio && (
                  <p className="text-xs text-slate-400 mt-0.5">Desde: {estudianteData.semestre_inicio}</p>
                )}
              </div>
            )}
            <p className="text-sm text-slate-600 mb-4">
              Al cambiar la carrera, la asignación actual se desactiva y se crea una nueva.
            </p>
            <form onSubmit={handleCarreraSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nueva carrera <span className="text-red-500">*</span></label>
                <SelectCustom name="id_carrera" value={formCarrera.id_carrera}
                  onChange={e => setFormCarrera({ ...formCarrera, id_carrera: e.target.value })}>
                  <option value="">Seleccione una carrera...</option>
                  {carreras.map(c => (
                    <option key={c.id_carrera} value={c.id_carrera}>
                      {c.nombre_carrera}{c.sigla_carrera ? ` (${c.sigla_carrera})` : ""}
                    </option>
                  ))}
                </SelectCustom>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Semestre de inicio</label>
                <input type="text" name="semestre_inicio" value={formCarrera.semestre_inicio}
                  onChange={e => setFormCarrera({ ...formCarrera, semestre_inicio: e.target.value })}
                  placeholder="ej. 2024-I" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={guardandoCarrera || !formCarrera.id_carrera}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
                  {guardandoCarrera ? "Guardando..." : "Cambiar carrera"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB BECAS ── */}
        {tab === "becas" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {becas.length === 0 ? "Sin becas registradas" : `${becas.length} beca${becas.length !== 1 ? "s" : ""}`}
              </p>
              <Link to={`/becas/nueva?estudiante=${id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva beca
              </Link>
            </div>

            {cargandoBecas ? (
              <p className="text-slate-400 text-sm text-center py-8">Cargando becas...</p>
            ) : becas.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 px-6 py-10 text-center">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 text-sm">Este estudiante no tiene becas registradas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {becas.map(b => (
                  <BecaCard key={b.id_beca} beca={b}
                    onCambiarEstado={beca => setModalEstado(beca)}
                    onEliminar={handleEliminarBeca} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleEstudiante;
