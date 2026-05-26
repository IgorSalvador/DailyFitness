import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Edit2, Users, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  DietPlanDto,
  DietPlanSubscriberDto,
  dietObjectiveLabels,
  dietLevelLabels,
  mealPeriodLabels,
  userDietPlanStatusLabels,
  EUserDietPlanStatus,
  adminGetDietPlan,
  adminActivateDietPlan,
  adminDeactivateDietPlan,
  adminGetDietPlanSubscribers,
  profGetManagedDietPlan,
  profActivateDietPlan,
  profDeactivateDietPlan,
  profGetDietPlanSubscribers,
} from "@/lib/diet-plans-api";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

const subscriberStatusStyles: Record<EUserDietPlanStatus, string> = {
  [EUserDietPlanStatus.Active]: "bg-emerald-500/10 text-emerald-400",
  [EUserDietPlanStatus.Cancelled]: "bg-secondary text-muted-foreground",
  [EUserDietPlanStatus.Completed]: "bg-blue-500/10 text-blue-400",
};

export default function ManagementDietPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const role = getUser()?.role;
  const isAdmin = role === "Administrator";
  const basePath = isAdmin ? "/dieta/gestao" : "/dieta/profissional";

  const [plan, setPlan] = useState<DietPlanDto | null>(null);
  const [subscribers, setSubscribers] = useState<DietPlanSubscriberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showSubscribers, setShowSubscribers] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPlan = isAdmin ? adminGetDietPlan : profGetManagedDietPlan;
    const fetchSubs = isAdmin ? adminGetDietPlanSubscribers : profGetDietPlanSubscribers;

    Promise.all([fetchPlan(id), fetchSubs(id)])
      .then(([p, s]) => { setPlan(p.data ?? null); setSubscribers(s.data ?? []); })
      .catch(() => toast.error("Erro ao carregar plano."))
      .finally(() => setLoading(false));
  }, [id, isAdmin]);

  const handleToggleStatus = async () => {
    if (!plan || !id) return;
    setTogglingStatus(true);
    try {
      const isActive = plan.status === "Active";
      const fn = isAdmin
        ? isActive ? adminDeactivateDietPlan : adminActivateDietPlan
        : isActive ? profDeactivateDietPlan : profActivateDietPlan;
      const res = await fn(id);
      setPlan(res.data ?? null);
      toast.success(isActive ? "Plano desativado." : "Plano ativado.");
    } catch {
      toast.error("Erro ao alterar status do plano.");
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    </div>
  );

  if (!plan) return null;

  const isActive = plan.status === "Active";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(basePath)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold gradient-text">{plan.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`${basePath}/${id}/editar`)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-border hover:bg-secondary transition-colors"
              >
                <Edit2 size={14} /> Editar
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                  isActive
                    ? "text-amber-400 border border-amber-400/30 hover:bg-amber-400/10"
                    : "text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10"
                }`}
              >
                {isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                {togglingStatus ? "..." : isActive ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-4">
            <span>Objetivo: <strong className="text-foreground">{dietObjectiveLabels[plan.objective]}</strong></span>
            <span>Nível: <strong className="text-foreground">{dietLevelLabels[plan.level]}</strong></span>
            <span>Duração mínima: <strong className="text-foreground">{plan.minimumDurationDays} dias</strong></span>
            <span>Refeições: <strong className="text-foreground">{plan.mealCount}</strong></span>
            <span>Status: <strong className={isActive ? "text-emerald-400" : "text-muted-foreground"}>{isActive ? "Ativo" : "Inativo"}</strong></span>
          </div>

          {plan.instructions && (
            <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Instruções</p>
              <p className="whitespace-pre-wrap">{plan.instructions}</p>
            </div>
          )}
        </div>

        {/* Meals */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Refeições</h3>
          {plan.meals.map((meal) => (
            <div key={meal.id} className="glass-card rounded-xl overflow-hidden">
              <button type="button"
                onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="text-left">
                  <p className="font-medium">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{mealPeriodLabels[meal.period]} · {meal.items.length} itens</p>
                </div>
                {expandedMeal === meal.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {expandedMeal === meal.id && (
                <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
                  {meal.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {item.calories && <p>{item.calories} kcal</p>}
                        {item.protein && <p>P: {item.protein}g</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subscribers */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSubscribers(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Users size={16} className="text-primary" />
              Assinantes ({subscribers.length})
              <span className="text-xs text-muted-foreground font-normal">
                · {plan.activeSubscriberCount} ativos
              </span>
            </span>
            {showSubscribers ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showSubscribers && (
            <div className="border-t border-border">
              {subscribers.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">Nenhum assinante ainda.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="px-5 py-3 text-left">Usuário</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Progresso</th>
                      <th className="px-5 py-3 text-left hidden md:table-cell">Início</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.userId} className="border-b border-border/50">
                        <td className="px-5 py-3">
                          <p className="font-medium">{sub.userName}</p>
                          <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${subscriberStatusStyles[sub.status]}`}>
                            {userDietPlanStatusLabels[sub.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-xs text-muted-foreground">
                          {sub.overallProgress.toFixed(0)}%
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {new Date(sub.startedAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
