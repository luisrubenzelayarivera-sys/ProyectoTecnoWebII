const CONFIG = {
  ACTIVA:     { bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700",  num: "text-emerald-800" },
  SUSPENDIDA: { bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-700",    num: "text-amber-800"   },
  FINALIZADA: { bg: "bg-slate-100",   border: "border-slate-200",   text: "text-slate-500",    num: "text-slate-700"   },
  ABANDONADA: { bg: "bg-red-50",      border: "border-red-200",     text: "text-red-600",      num: "text-red-800"     },
};

const KPICard = ({ estado, total }) => {
  const c = CONFIG[estado] || { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", num: "text-blue-800" };
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-5 flex flex-col gap-1`}>
      <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>{estado}</span>
      <span className={`text-4xl font-black ${c.num}`}>{total}</span>
      <span className="text-xs text-slate-400">becas</span>
    </div>
  );
};

export default KPICard;
