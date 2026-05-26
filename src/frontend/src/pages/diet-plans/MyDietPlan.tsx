import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import {
  UserDietPlanDto,
  EUserDietPlanStatus,
  mealPeriodLabels,
  dietObjectiveLabels,
  dietLevelLabels,
  CancelDietPlanPayload,
  getCurrentDietPlanProgress,
  cancelDietPlan,
  markDietItemProgress,
  finishDietMealDay,
} from "@/lib/diet-plans-api";

export default function MyDietPlan() {
  const [plan, setPlan] = useState<UserDietPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [togglingItem, setTogglingItem] = useState<string | null>(null);
  const [finishingMeal, setFinishingMeal] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCurrentDietPlanProgress();
      setPlan(res.data ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // "não possui" = backend confirming no active plan → show empty state
      // anything else = unexpected error (server/network) → show error
      if (message.toLowerCase().includes("não possui") || message.toLowerCase().includes("nao possui")) {
        setPlan(null);
      } else {
        setError(message || "Erro ao carregar plano. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Set de itens completados hoje: "mealId:itemId"
  const completedTodaySet = new Set(
    (plan?.progresses ?? [])
      .filter((p) => p.isCompleted && p.progressDate.startsWith(todayStr))
      .map((p) => p.dietMealItemId)
  );

  const getMealLogToday = (mealId: string) =>
    plan?.dailyLogs.find(
      (l) => l.dietMealId === mealId && l.logDate.startsWith(todayStr)
    );

  const handleToggleItem = async (mealId: string, itemId: string, completed: boolean) => {
    const key = `${mealId}:${itemId}`;
    setTogglingItem(key);
    try {
      const res = await markDietItemProgress(mealId, itemId, { isCompleted: completed, progressDate: todayStr });
      setPlan(res.data ?? null);
      if (completed) toast.success("Item marcado como concluído!");
    } catch {
      toast.error("Erro ao registrar progresso.");
    } finally {
      setTogglingItem(null);
    }
  };

  const handleFinishMeal = async (mealId: string) => {
    setFinishingMeal(mealId);
    try {
      await finishDietMealDay(mealId, { progressDate: todayStr });
      toast.success("Refeição finalizada!");
      await load();
    } catch {
      toast.error("Erro ao finalizar refeição.");
    } finally {
      setFinishingMeal(null);
    }
  };

  const handleCancel = async () => {
    if (!plan || !confirm("Tem certeza que deseja cancelar este plano alimentar?")) return;
    setCancelling(true);
    const payload: CancelDietPlanPayload = { userDietPlanId: plan.id };
    try {
      await cancelDietPlan(payload);
      toast.success("Plano cancelado.", { description: "Você pode se inscrever em outro plano." });
      setPlan(null);
    } catch {
      toast.error("Erro ao cancelar plano.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-[5%] py-5">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // ── Erro ─────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen px-4 md:px-[5%] py-5">
        <DashboardHeader />
        <main className="w-full max-w-3xl mx-auto pt-6 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold">Meu Plano Alimentar</h2>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Erro ao carregar plano</p>
                <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Sem plano ativo ──────────────────────────────────────────────────────────

  if (!plan || plan.userDietPlanStatus !== EUserDietPlanStatus.Active) {
    return (
      <div className="min-h-screen px-4 md:px-[5%] py-5">
        <DashboardHeader />
        <main className="w-full max-w-3xl mx-auto pt-6 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold">Meu Plano Alimentar</h2>
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Utensils className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum plano ativo</p>
              <p className="text-sm mt-1">Você não possui um plano alimentar ativo no momento.</p>
            </div>
            <Link
              to="/dieta"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              Explorar Planos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const dietPlan = plan.dietPlan!;
  const meals = dietPlan.meals ?? [];

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Meu Plano Alimentar</h2>
            <p className="text-sm text-muted-foreground mt-1">Refeições de hoje</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              to="/dieta/historico"
              className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              Histórico
            </Link>
          </div>
        </div>

        {/* Plan summary */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Utensils className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">{dietPlan.name}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{dietObjectiveLabels[dietPlan.objective]}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{dietLevelLabels[dietPlan.level]}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Início: {new Date(plan.startedAt).toLocaleDateString("pt-BR")}</span>
            <span>
              Progresso geral:{" "}
              <span className="text-primary font-medium">{plan.overallProgress.toFixed(1)}%</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-60"
          >
            {cancelling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            Cancelar inscrição
          </button>
        </div>

        {/* Meals */}
        {meals.map((meal) => {
          const log = getMealLogToday(meal.id);
          const isFinished = log !== undefined && log.completedItems >= log.totalItems && log.totalItems > 0;
          const progressPct = log?.completionPercentage ?? 0;
          const allCompleted = meal.items.length > 0 && meal.items.every(
            (item) => completedTodaySet.has(item.id)
          );

          return (
            <div key={meal.id} className="glass-card rounded-xl p-5 space-y-4">
              {/* Meal header */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">
                    {meal.order}. {meal.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mealPeriodLabels[meal.period]}
                    {meal.description ? ` · ${meal.description}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {isFinished ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✓ Concluída
                    </span>
                  ) : (
                    <span className="text-xs text-primary font-medium">{progressPct.toFixed(0)}%</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: "var(--gradient-primary)" }}
                />
              </div>

              {/* Items */}
              <div className="space-y-2">
                {meal.items.map((item) => {
                  const done = completedTodaySet.has(item.id);
                  const key = `${meal.id}:${item.id}`;
                  const isLoading = togglingItem === key;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleItem(meal.id, item.id, !done)}
                      disabled={isLoading || isFinished}
                      className={`w-full flex items-start gap-3 text-left p-3 rounded-lg border transition-all ${
                        done
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      } disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0 mt-0.5" />
                      ) : done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          <span className="text-xs text-primary">{item.quantity} {item.unit}</span>
                          {item.calories && (
                            <span className="text-xs text-muted-foreground">{item.calories} kcal</span>
                          )}
                          {item.protein && (
                            <span className="text-xs text-muted-foreground">Prot: {item.protein}g</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Finalizar refeição — só aparece quando todos os itens foram marcados */}
              {!isFinished && allCompleted && (
                <button
                  type="button"
                  onClick={() => handleFinishMeal(meal.id)}
                  disabled={finishingMeal === meal.id}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {finishingMeal === meal.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Finalizar Refeição do Dia
                </button>
              )}
            </div>
          );
        })}

      </main>
    </div>
  );
}
