const pool = require("../../config/db");
const paginar = require("../../config/pagination");

const estadosBecas = async () => {
  const result = await pool.query(
    `SELECT 
       estado_beca,
       COUNT(*) AS total
     FROM becas
     WHERE estado = true
     GROUP BY estado_beca
     ORDER BY total DESC`,
  );
  return result.rows;
};

const tiposBecas = async () => {
  const result = await pool.query(
    `SELECT 
       tb.nombre_beca,
       COUNT(b.id_beca) AS total,
       ROUND(AVG(b.porcentaje), 2) AS promedio_porcentaje
     FROM tipos_beca tb
     LEFT JOIN becas b ON tb.id_tipo_beca = b.id_tipo_beca AND b.estado = true
     GROUP BY tb.nombre_beca
     ORDER BY total DESC`,
  );
  return result.rows;
};

const estudiantesConBecas = async (query) => {
  const { page, limit, offset } = paginar(query);

  const total = await pool.query(
    "SELECT COUNT(*) FROM estudiantes WHERE estado = true",
  );

  const result = await pool.query(
    `SELECT
       e.id_estudiante,
       e.nombre_completo,
       e.carnet,
       e.email_ucb,
       COUNT(b.id_beca) AS total_becas,
       JSON_AGG(
         JSON_BUILD_OBJECT(
           'id_beca',     b.id_beca,
           'tipo_beca',   tb.nombre_beca,
           'porcentaje',  b.porcentaje,
           'estado_beca', b.estado_beca,
           'gestion',     b.gestion,
           'periodo',     b.periodo
         )
       ) FILTER (WHERE b.id_beca IS NOT NULL) AS becas
     FROM estudiantes e
     LEFT JOIN becas b ON e.id_estudiante = b.id_estudiante AND b.estado = true
     LEFT JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     WHERE e.estado = true
     GROUP BY e.id_estudiante, e.nombre_completo, e.carnet, e.email_ucb
     ORDER BY total_becas DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return {
    data: result.rows,
    total: parseInt(total.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(total.rows[0].count / limit),
  };
};

const evaluaciones = async (query) => {
  const { page, limit, offset } = paginar(query);

  const total = await pool.query(
    "SELECT COUNT(*) FROM evaluaciones WHERE estado = true",
  );

  const result = await pool.query(
    `SELECT 
       ev.id_evaluacion,
       ev.puntaje_desempeno,
       ev.comentario_jefe_area,
       ev.recomienda_continuidad,
       e.nombre_completo,
       ar.nombre_area,
       tb.nombre_beca,
       b.porcentaje,
       b.gestion,
       b.periodo
     FROM evaluaciones ev
     JOIN asignacion a  ON ev.id_asignacion = a.id_asignacion
     JOIN becas b       ON a.id_beca = b.id_beca
     JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
     JOIN areas ar      ON a.id_area = ar.id_area
     JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     WHERE ev.estado = true
     ORDER BY ev.puntaje_desempeno DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return {
    data: result.rows,
    total: parseInt(total.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(total.rows[0].count / limit),
  };
};

const infoGeneral = async () => {
  const [carreras, areas] = await Promise.all([
    pool.query(
      `SELECT c.id_carrera, c.nombre_carrera, c.sigla_carrera,
         COUNT(ce.id_estudiante) AS total_estudiantes
       FROM carreras c
       LEFT JOIN carr_estudiante ce ON c.id_carrera = ce.id_carrera
       WHERE c.estado = true
       GROUP BY c.id_carrera, c.nombre_carrera, c.sigla_carrera
       ORDER BY total_estudiantes DESC`,
    ),
    pool.query(
      `SELECT ar.id_area, ar.nombre_area, ar.ubicacion_campus,
         ar.responsable_nombre, ar.responsable_telefono,
         COUNT(a.id_asignacion) AS total_asignaciones
       FROM areas ar
       LEFT JOIN asignacion a ON ar.id_area = a.id_area AND a.estado = true
       WHERE ar.estado = true
       GROUP BY ar.id_area, ar.nombre_area, ar.ubicacion_campus,
                ar.responsable_nombre, ar.responsable_telefono
       ORDER BY total_asignaciones DESC`,
    ),
  ]);

  return {
    carreras: carreras.rows,
    areas: areas.rows,
  };
};

module.exports = {
  estadosBecas,
  tiposBecas,
  estudiantesConBecas,
  evaluaciones,
  infoGeneral,
};
