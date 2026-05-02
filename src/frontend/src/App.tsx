import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.tsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.tsx";
import SessionExpiredDialog from "./components/SessionExpiredDialog.tsx";
import ProfessionalsList from "./pages/professionals/ProfessionalsList.tsx";
import ProfessionalDetail from "./pages/professionals/ProfessionalDetail.tsx";
import CreateProfessionalRequest from "./pages/professionals/CreateProfessionalRequest.tsx";
import ProfessionalRequestsList from "./pages/professionals/admin/ProfessionalRequestsList.tsx";
import ProfessionalRequestDetail from "./pages/professionals/admin/ProfessionalRequestDetail.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionExpiredDialog />
        <Routes>
          {/* Rotas privadas: exigem autenticacao valida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/editar"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Profissionais */}
          <Route
            path="/profissionais"
            element={
              <ProtectedRoute>
                <ProfessionalsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profissionais/solicitar"
            element={
              <RoleProtectedRoute allowedRoles={["General"]}>
                <CreateProfessionalRequest />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/profissionais/admin/solicitacoes"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ProfessionalRequestsList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/profissionais/admin/solicitacoes/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ProfessionalRequestDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/profissionais/:id"
            element={
              <ProtectedRoute>
                <ProfessionalDetail />
              </ProtectedRoute>
            }
          />

          {/* Rotas publicas: bloqueadas se ja autenticado */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
