import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";

import Estudiantes from "./pages/estudiantes/Estudiantes";
import NuevoEstudiante from "./pages/estudiantes/NuevoEstudiante";
import DetalleEstudiante from "./pages/estudiantes/DetalleEstudiante";
import BuscadorEstudiantes from "./pages/estudiantes/BuscadorEstudiantes";

import Becas from "./pages/becas/Becas";
import NuevaBeca from "./pages/becas/NuevaBeca";
import DetalleBeca from "./pages/becas/DetalleBeca";
import EstadoBeca from "./pages/becas/EstadoBeca";
import NuevoSubtipo from "./pages/becas/NuevoSubtipo";

import Asignacion from "./pages/asignacion/Asignacion";
import NuevaAsignacion from "./pages/asignacion/NuevaAsignacion";
import EstadoAsignacion from "./pages/asignacion/EstadoAsignacion";
import Evaluacion from "./pages/asignacion/Evaluacion";

import Usuarios from "./pages/usuarios/Usuarios";
import NuevoUsuario from "./pages/usuarios/NuevoUsuario";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Pública: bienvenida y login ── */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          {/* ── Privadas: ADMIN, TRABAJO_SOCIAL, JEFE_AREA ── */}
          <Route element={<PrivateRoute roles={["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/estudiantes" element={<Estudiantes />} />
            <Route path="/estudiantes/buscar" element={<BuscadorEstudiantes />} />
            <Route path="/estudiantes/nuevo" element={<NuevoEstudiante />} />
            <Route path="/estudiantes/:id" element={<DetalleEstudiante />} />

            <Route path="/becas" element={<Becas />} />
            <Route path="/becas/nueva" element={<NuevaBeca />} />
            <Route path="/becas/:id" element={<DetalleBeca />} />
            <Route path="/becas/:id/estado" element={<EstadoBeca />} />
            <Route path="/becas/:id/subtipo" element={<NuevoSubtipo />} />

            <Route path="/asignacion" element={<Asignacion />} />
            <Route path="/asignacion/nueva" element={<NuevaAsignacion />} />
            <Route path="/asignacion/:id/estado" element={<EstadoAsignacion />} />
            <Route path="/asignacion/:id/evaluacion" element={<Evaluacion />} />
          </Route>

          {/* ── Privadas: solo ADMIN ── */}
          <Route element={<PrivateRoute roles={["ADMIN"]} />}>
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/nuevo" element={<NuevoUsuario />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
