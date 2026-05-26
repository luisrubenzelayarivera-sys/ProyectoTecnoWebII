import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";

import Estudiantes from "./pages/estudiantes/Estudiantes";
import NuevoEstudiante from "./pages/estudiantes/NuevoEstudiante";
import DetalleEstudiante from "./pages/estudiantes/DetalleEstudiante";

import Becas from "./pages/becas/Becas";
import NuevaBeca from "./pages/becas/NuevaBeca";
import DetalleBeca from "./pages/becas/DetalleBeca";
import EstadoBeca from "./pages/becas/EstadoBeca";

import Asignacion from "./pages/asignacion/Asignacion";
import NuevaAsignacion from "./pages/asignacion/NuevaAsignacion";
import EstadoAsignacion from "./pages/asignacion/EstadoAsignacion";
import Evaluacion from "./pages/asignacion/Evaluacion";

import Usuarios from "./pages/usuarios/Usuarios";
import NuevoUsuario from "./pages/usuarios/NuevoUsuario";

import NuevoSubtipo from "./pages/becas/NuevoSubtipo";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />
          {/* Privadas - ADMIN y TRABAJO_SOCIAL */}
          <Route
            element={
              <PrivateRoute roles={["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA"]} />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/estudiantes" element={<Estudiantes />} />
            <Route path="/estudiantes/nuevo" element={<NuevoEstudiante />} />
            <Route path="/estudiantes/:id" element={<DetalleEstudiante />} />
            <Route path="/becas" element={<Becas />} />
            <Route path="/becas/nueva" element={<NuevaBeca />} />
            <Route path="/becas/:id" element={<DetalleBeca />} />
            <Route path="/becas/:id/estado" element={<EstadoBeca />} />
            <Route path="/asignacion" element={<Asignacion />} />
            <Route path="/asignacion/nueva" element={<NuevaAsignacion />} />
            <Route
              path="/asignacion/:id/estado"
              element={<EstadoAsignacion />}
            />
            <Route path="/asignacion/:id/evaluacion" element={<Evaluacion />} />
            <Route path="/becas/:id/subtipo" element={<NuevoSubtipo />} />
          </Route>
          {/* Privadas - solo ADMIN*/}
          <Route element={<PrivateRoute roles={["ADMIN"]} />}>
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/nuevo" element={<NuevoUsuario />} />
          </Route>
          {/* Redirige raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
