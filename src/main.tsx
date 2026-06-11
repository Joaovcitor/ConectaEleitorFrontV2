import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { OperationsOnly, UserRegistrationOnly } from "./components/Guard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AgendaDetailsPage } from "./pages/AgendaDetailsPage";
import { AgendaEditPage } from "./pages/AgendaEditPage";
import { AgendasPage } from "./pages/AgendasPage";
import { AppointmentDetailsPage } from "./pages/AppointmentDetailsPage";
import { AppointmentEditPage } from "./pages/AppointmentEditPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { CitizenDetailsPage } from "./pages/CitizenDetailsPage";
import { CitizenEditPage } from "./pages/CitizenEditPage";
import { CitizensPage } from "./pages/CitizensPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DemandDetailsPage } from "./pages/DemandDetailsPage";
import { DemandEditPage } from "./pages/DemandEditPage";
import { DemandsPage } from "./pages/DemandsPage";
import { LoginPage } from "./pages/LoginPage";
import { PlansPage, PublicPlansPage } from "./pages/PlansPage";
import { PostDetailsPage } from "./pages/PostDetailsPage";
import { PostsPage } from "./pages/PostsPage";
import { PublicHomePage } from "./pages/PublicHomePage";
import { UserRegistrationPage } from "./pages/UserRegistrationPage";
import "./styles/global.css";

function HomeRoute() {
  const { isVoter } = useAuth();
  return isVoter ? <Navigate to="/demandas" replace /> : <DashboardPage />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/apresentacao" element={<PublicHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/planos-publicos" element={<PublicPlansPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomeRoute />} />
              <Route path="/eleitores" element={<CitizensPage />} />
              <Route path="/eleitores/:id" element={<CitizenDetailsPage />} />
              <Route path="/eleitores/:id/editar" element={<CitizenEditPage />} />
              <Route path="/demandas" element={<DemandsPage />} />
              <Route path="/demandas/:id" element={<DemandDetailsPage />} />
              <Route path="/demandas/:id/editar" element={<DemandEditPage />} />
              <Route path="/agendas" element={<OperationsOnly><AgendasPage /></OperationsOnly>} />
              <Route path="/agendas/:id" element={<OperationsOnly><AgendaDetailsPage /></OperationsOnly>} />
              <Route path="/agendas/:id/editar" element={<OperationsOnly><AgendaEditPage /></OperationsOnly>} />
              <Route path="/compromissos" element={<OperationsOnly><AppointmentsPage /></OperationsOnly>} />
              <Route path="/compromissos/:id" element={<OperationsOnly><AppointmentDetailsPage /></OperationsOnly>} />
              <Route path="/compromissos/:id/editar" element={<OperationsOnly><AppointmentEditPage /></OperationsOnly>} />
              <Route path="/posts" element={<OperationsOnly><PostsPage /></OperationsOnly>} />
              <Route path="/posts/:id" element={<OperationsOnly><PostDetailsPage /></OperationsOnly>} />
              <Route path="/planos" element={<PlansPage />} />
              <Route path="/usuarios" element={<UserRegistrationOnly><UserRegistrationPage /></UserRegistrationOnly>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
