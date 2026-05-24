import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, CheckCircle, Circle, TrendingUp, XCircle } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  UserDietPlanDto,
  EUserDietPlanStatus,
  mealPeriodLabels,
  CancelDietPlanPayload,
  getCurrentDietPlanProgress,
  cancelDietPlan,
  markDietItemProgress,
  finishDietMealDay,
} from "@/lib/diet-plans-api";
import { toast } from "sonner";

export default function MyDietPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<UserDietPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [togglingItem, setTogglingItem] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getCurrentDietPlanProgress();
      setPlan(res.data ?? null);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const isItemCompletedToday = (itemId: string) =>
    plan?.progresses.some(
      (p) => p.dietMealItemId === itemId && p.progressDate.startsWith(todayStr) && p.isCompleted
    ) ?? false;

  const getMealLogToday = (mealId: string) =>
    plan?.dailyLogs.find(
      (l) => l.dietMealId === mealId && l.logDate.startsWith(todayStr)
    );

  const handleToggleItem = async (mealId: string, itemId: string, completed: boolean) => {
    if (!plan) return;
    const key = `${mealId}-${itemId}`;
    setTogglingItem(key);
    try {
      const res = await markDietItemProgress(mealId, itemId, { isCompleted: completed });
      setPlan(res.data ?? null);
    } catch {
      toast.error("Erro ao registrar progresso.");
    } finally {
      setTogglingItem(null);
    }
  };

  const handleFinishMeal = async (mealId: string) => {
    try {
      await finishDietMealDay(mealId);
      toast.success("Refeição finalizada!");
      await load();
    } catch {
      toast.error("Erro ao finalizar refeição.");
    }
  };

  const handleCancel = async () => {
    if (!plan || !window.confirm("Tem certeza que deseja cancelar seu plano alimentar?")) return;
    setCancelling(true);
    const payload: CancelDietPlanPayload = { userDietPlanId: plan.id };
    try {
      await cancelDietPlan(payload);
      toast.success("Plano cancelado.");
      await load();
    } catch {
      toast.error("Erro ao cancelar plano.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <DashboardHeader />
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!plan || plan.userDietPlanStatus !== EUserDietPlanStatus.Active) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <DashboardHeader />
        <main className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <Utensils size={40} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano ativo</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Você não possui um plano alimentar ativo no momento.
            </p>
            <button
              onClick={() => navigate("/dieta")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              Explorar planos
            </button>
          </div>
        </main>
      </div>
    );
  }

  const meals = plan.dietPlan?.meals ?? [];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">{plan.dietPlan?.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Iniciado em {new Date(plan.startedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <XCircle size={15} /> {cancelling ? "Cancelando..." : "Cancelar plano"}
          </button>
        </div>

        {/* Overall progress */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" /> Progresso geral
            </span>
            <span className="text-sm font-semibold text-primary">{plan.overallProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${plan.overallProgress}%`, background: "var(--gradient-primary)" }}
            />
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Refeições de hoje</h3>
          {meals.map((meal) => {
            const log = getMealLogToday(meal.id);
            const pct = log?.completionPercentage ?? 0;

            return (
              <div key={meal.id} className="glass-card rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Utensils size={16} className="text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{meal.name}</p>
                      <p className="text-xs text-muted-foreground">{mealPeriodLabels[meal.period]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-primary font-semibold">{pct.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">{log ? `${log.completedItems}/${log.totalItems}` : `0/${meal.items.length}`}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{expandedMeal === meal.id ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expandedMeal === meal.id && (
                  <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
                    {meal.items.map((item) => {
                      const completed = isItemCompletedToday(item.id);
                      const key = `${meal.id}-${item.id}`;
                      const toggling = togglingItem === key;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={toggling}
                          onClick={() => handleToggleItem(meal.id, item.id, !completed)}
                          className={`w-full flex items-start gap-3 py-2.5 px-3 rounded-lg transition-all text-left
                            ${completed ? "bg-emerald-500/10" : "hover:bg-secondary/60"}`}
                        >
                          {completed
                            ? <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                            : <Circle size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${completed ? "line-through text-muted-foreground" : ""}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleFinishMeal(meal.id)}
                      className="mt-2 w-full py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Finalizar refeição
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/dieta/historico")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver histórico →
          </button>
        </div>
      </main>
    </div>
  );
}
