import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Gestión de estudiantes",
    desc: "Registro completo con historial académico, cambio de carrera y seguimiento de becas por estudiante.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Tipos de beca",
    desc: "Soporte para todos los tipos: académicas, institucionales, deportivas, culturales, de discapacidad y continuas.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Asignación de áreas",
    desc: "Asignación de horas de trabajo a áreas de la universidad para becas de servicio comunitario.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Reportes y panel",
    desc: "Dashboard con KPIs por estado y tipo de beca, historial de evaluaciones y datos de carreras y áreas.",
  },
];

const Welcome = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-sm">Becas UCB</span>
        </div>
        <Link to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          Ingresar
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="max-w-2xl w-full">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="hidden sm:inline">Universidad Católica Boliviana "San Pablo"</span>
            <span className="sm:hidden">UCB "San Pablo"</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
            Sistema de Gestión<br />
            <span className="text-blue-600">de Becas</span>
          </h1>

          <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            Plataforma del Cuarto de Control para la administración integral de becas
            estudiantiles, asignaciones y evaluaciones de desempeño.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-sm text-sm">
              Acceder al sistema
            </Link>
            <a href="#features"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl transition border border-slate-200 text-sm text-center">
              Ver funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white border-t border-slate-100 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Funcionalidades principales</h2>
          <p className="text-slate-400 text-sm text-center mb-8 sm:mb-10">
            Herramientas diseñadas para el flujo de trabajo del Cuarto de Control
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex gap-4 p-4 sm:p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition">
                <div className="shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="px-4 sm:px-6 py-10 sm:py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Acceso por roles</h2>
          <p className="text-slate-400 text-sm mb-6 sm:mb-8">Cada perfil accede únicamente a las funciones que le corresponden</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { rol: "Administrador",  color: "violet", desc: "Acceso total al sistema" },
              { rol: "Trabajo Social", color: "blue",   desc: "Becas y estudiantes" },
              { rol: "Jefe de Área",   color: "amber",  desc: "Evaluaciones de becarios" },
              { rol: "Becario",        color: "emerald",desc: "Solo lectura" },
            ].map(r => (
              <div key={r.rol} className={`bg-${r.color}-50 border border-${r.color}-200 rounded-xl p-3 sm:p-4`}>
                <p className={`font-semibold text-${r.color}-800 text-xs sm:text-sm mb-1`}>{r.rol}</p>
                <p className={`text-${r.color}-600 text-xs`}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-5 text-xs px-4">
        <p>Sistema de Becas UCB — Cuarto de Control · Desarrollo académico UCB {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Welcome;
