const colorKPI = (estado) => {
  switch (estado) {
    case "ACTIVA":
      return {
        bg: "bg-green-50",
        text: "text-green-800",
        num: "text-green-700",
      };
    case "SUSPENDIDA":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-800",
        num: "text-yellow-700",
      };
    case "FINALIZADA":
      return { bg: "bg-gray-100", text: "text-gray-600", num: "text-gray-700" };
    case "ABANDONADA":
      return { bg: "bg-red-50", text: "text-red-800", num: "text-red-700" };
    default:
      return { bg: "bg-blue-50", text: "text-blue-800", num: "text-blue-700" };
  }
};

const KPICard = ({ estado, total }) => {
  const colors = colorKPI(estado);
  return (
    <div className={`${colors.bg} rounded-2xl p-6 flex flex-col gap-1`}>
      <span
        className={`text-xs font-semibold uppercase tracking-wider
        ${colors.text}`}
      >
        {estado}
      </span>
      <span className={`text-5xl font-black ${colors.num}`}>{total}</span>
      <span className="text-xs text-gray-400">becas</span>
    </div>
  );
};

export default KPICard;
