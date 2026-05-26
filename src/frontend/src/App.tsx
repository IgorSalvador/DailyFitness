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
import ChallengesList from "./pages/challenges/ChallengesList.tsx";
import MyChallenges from "./pages/challenges/MyChallenges.tsx";
import MyChallengeDetail from "./pages/challenges/MyChallengeDetail.tsx";
import AdminChallengesList from "./pages/challenges/admin/AdminChallengesList.tsx";
import CreateChallenge from "./pages/challenges/admin/CreateChallenge.tsx";
import AdminChallengeDetail from "./pages/challenges/admin/AdminChallengeDetail.tsx";
import ProfessionalChallengesList from "./pages/challenges/professional/ProfessionalChallengesList.tsx";
import CreateProfessionalChallenge from "./pages/challenges/professional/CreateProfessionalChallenge.tsx";
import ProfessionalChallengeDetail from "./pages/challenges/professional/ProfessionalChallengeDetail.tsx";
import TrainingPlansList from "./pages/training-plans/TrainingPlansList.tsx";
import TrainingPlanDetail from "./pages/training-plans/TrainingPlanDetail.tsx";
import MyTrainingPlan from "./pages/training-plans/MyTrainingPlan.tsx";
import TrainingPlanHistory from "./pages/training-plans/TrainingPlanHistory.tsx";
import ManagementTrainingPlansList from "./pages/training-plans/management/ManagementTrainingPlansList.tsx";
import ManagementTrainingPlanForm from "./pages/training-plans/management/ManagementTrainingPlanForm.tsx";
import ManagementTrainingPlanDetail from "./pages/training-plans/management/ManagementTrainingPlanDetail.tsx";
import DietPlansList from "./pages/diet-plans/DietPlansList.tsx";
import DietPlanDetail from "./pages/diet-plans/DietPlanDetail.tsx";
import MyDietPlan from "./pages/diet-plans/MyDietPlan.tsx";
import DietPlanHistory from "./pages/diet-plans/DietPlanHistory.tsx";
import ManagementDietPlansList from "./pages/diet-plans/management/ManagementDietPlansList.tsx";
import ManagementDietPlanForm from "./pages/diet-plans/management/ManagementDietPlanForm.tsx";
import ManagementDietPlanDetail from "./pages/diet-plans/management/ManagementDietPlanDetail.tsx";

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

          {/* Desafios — User */}
          <Route
            path="/desafios"
            element={
              <ProtectedRoute>
                <ChallengesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/desafios/meus"
            element={
              <ProtectedRoute>
                <MyChallenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/desafios/meus/:userChallengeId"
            element={
              <ProtectedRoute>
                <MyChallengeDetail />
              </ProtectedRoute>
            }
          />

          {/* Desafios — Admin */}
          <Route
            path="/desafios/admin"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <AdminChallengesList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/desafios/admin/criar"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <CreateChallenge />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/desafios/admin/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <AdminChallengeDetail />
              </RoleProtectedRoute>
            }
          />

          {/* Desafios — Professional */}
          <Route
            path="/desafios/profissional"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ProfessionalChallengesList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/desafios/profissional/criar"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <CreateProfessionalChallenge />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/desafios/profissional/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ProfessionalChallengeDetail />
              </RoleProtectedRoute>
            }
          />

          {/* Planos de Treino — User */}
          <Route
            path="/treinos"
            element={
              <ProtectedRoute>
                <TrainingPlansList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treinos/meu-plano"
            element={
              <ProtectedRoute>
                <MyTrainingPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treinos/historico"
            element={
              <ProtectedRoute>
                <TrainingPlanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treinos/:id"
            element={
              <ProtectedRoute>
                <TrainingPlanDetail />
              </ProtectedRoute>
            }
          />

          {/* Planos de Treino — Admin */}
          <Route
            path="/treinos/gestao"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementTrainingPlansList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/treinos/gestao/criar"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementTrainingPlanForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/treinos/gestao/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementTrainingPlanDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/treinos/gestao/:id/editar"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementTrainingPlanForm />
              </RoleProtectedRoute>
            }
          />

          {/* Planos de Treino — Professional */}
          <Route
            path="/treinos/profissional"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementTrainingPlansList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/treinos/profissional/criar"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementTrainingPlanForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/treinos/profissional/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementTrainingPlanDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/treinos/profissional/:id/editar"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementTrainingPlanForm />
              </RoleProtectedRoute>
            }
          />

          {/* Planos Alimentares — User */}
          <Route
            path="/dieta"
            element={
              <ProtectedRoute>
                <DietPlansList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dieta/meu-plano"
            element={
              <ProtectedRoute>
                <MyDietPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dieta/historico"
            element={
              <ProtectedRoute>
                <DietPlanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dieta/:id"
            element={
              <ProtectedRoute>
                <DietPlanDetail />
              </ProtectedRoute>
            }
          />

          {/* Planos Alimentares — Admin */}
          <Route
            path="/dieta/gestao"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementDietPlansList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dieta/gestao/criar"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementDietPlanForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dieta/gestao/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementDietPlanDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dieta/gestao/:id/editar"
            element={
              <RoleProtectedRoute allowedRoles={["Administrator"]}>
                <ManagementDietPlanForm />
              </RoleProtectedRoute>
            }
          />

          {/* Planos Alimentares — Professional */}
          <Route
            path="/dieta/profissional"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementDietPlansList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dieta/profissional/criar"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementDietPlanForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dieta/profissional/:id"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementDietPlanDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/dieta/profissional/:id/editar"
            element={
              <RoleProtectedRoute allowedRoles={["Professional"]}>
                <ManagementDietPlanForm />
              </RoleProtectedRoute>
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
