import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
  Users,
  ChevronRight,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getUser } from "@/lib/auth";
import {
  adminGetAllTrainingPlans,
  profGetManagedPlans,
  TrainingPlanDto,
  ETrainingLevel,
  TrainingObjectiveLabel,
  TrainingLevelLabel,
} from "@/lib/training-plans-api";

const levelColors: Record<ETrainingLevel, string> = {
  [ETrainingLevel.Beginner]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [ETrainingLevel.Intermediate]: "bg-primary/10 text-primary border-primary/30",
  [ETrainingLevel.Advanced]: "bg-destructive/10 text-destructive border-destructive/30",
};

const ManagementTrainingPlansList = () => {
  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const baseRoute = isAdmin ? "/treinos/gestao" : "/treinos/profissional";

  const [plans, setPlans] = useState<TrainingPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = isAdmin
        ? await adminGetAllTrainingPlans()
        : await profGetManagedPlans();
      setPlans(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar planos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-semibold">
              {isAdmin ? "Gerenciar Planos de Treino" : "Meus Planos de Treino"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin
                ? "Administração completa dos planos da plataforma"
                : "Planos que você criou e gerencia"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            <Link
              to={`${baseRoute}/criar`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Criar Plano
            </Link>
          </div>
        </div>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando planos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro ao carregar planos</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum plano cadastrado</p>
              <p className="text-sm mt-1">
                Crie o primeiro plano de treino para os usuários da plataforma.
              </p>
            </div>
            <Link
              to={`${baseRoute}/criar`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 mt-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Plano
            </Link>
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Plano
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Nível
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Inscritos
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Treinos
                  </th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <PlanRow key={plan.id} plan={plan} baseRoute={baseRoute} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

// ── PlanRow ────────────────────────────────────────────────────────────────────

interface PlanRowProps {
  plan: TrainingPlanDto;
  baseRoute: string;
}

const PlanRow = ({ plan, baseRoute }: PlanRowProps) => (
  <tr className="hover:bg-secondary/30 transition-colors group">
    <td className="px-6 py-4">
      <div>
        <p className="font-medium text-foreground line-clamp-1">{plan.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
          {TrainingObjectiveLabel[plan.objective]}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5 md:hidden">
          <span className={`px-2 py-0.5 rounded-full text-xs border ${levelColors[plan.level]}`}>
            {TrainingLevelLabel[plan.level]}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs border ${
              plan.status === 1
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {plan.status === 1 ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>
    </td>
    <td className="px-4 py-4 hidden md:table-cell">
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${levelColors[plan.level]}`}>
        {TrainingLevelLabel[plan.level]}
      </span>
    </td>
    <td className="px-4 py-4 hidden lg:table-cell">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          plan.status === 1
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-secondary text-muted-foreground border-border"
        }`}
      >
        {plan.status === 1 ? "Ativo" : "Inativo"}
      </span>
    </td>
    <td className="px-4 py-4 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="w-3.5 h-3.5" />
        <span>
          {plan.activeSubscriberCount} ativo{plan.activeSubscriberCount !== 1 ? "s" : ""} / {plan.subscriberCount} total
        </span>
      </div>
    </td>
    <td className="px-4 py-4 hidden md:table-cell">
      <span className="text-xs text-muted-foreground">
        {plan.workouts?.length ?? 0} treino{(plan.workouts?.length ?? 0) !== 1 ? "s" : ""}
      </span>
    </td>
    <td className="px-4 py-4 text-right">
      <Link
        to={`${baseRoute}/${plan.id}`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors"
      >
        Gerenciar <ChevronRight className="w-3 h-3" />
      </Link>
    </td>
  </tr>
);

export default ManagementTrainingPlansList;
