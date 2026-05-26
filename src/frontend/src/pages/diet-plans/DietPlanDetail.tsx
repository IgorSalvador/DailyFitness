import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Utensils, Clock, Target, BarChart2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  DietPlanDto,
  UserDietPlanDto,
  EUserDietPlanStatus,
  dietLevelLabels,
  dietObjectiveLabels,
  mealPeriodLabels,
  getDietPlanDetail,
  getCurrentDietPlan,
  subscribeDietPlan,
} from "@/lib/diet-plans-api";
import { toast } from "sonner";

export default function DietPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<DietPlanDto | null>(null);
  const [activePlan, setActivePlan] = useState<UserDietPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");

      const [planRes, currentRes] = await Promise.allSettled([
        getDietPlanDetail(id),
        getCurrentDietPlan(),
      ]);

      if (planRes.status === "fulfilled" && planRes.value.data) {
        setPlan(planRes.value.data);
      } else {
        setError("Plano alimentar não encontrado.");
      }

      if (currentRes.status === "fulfilled" && currentRes.value.data) {
        setActivePlan(currentRes.value.data);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const handleSubscribe = async () => {
    if (!plan) return;
    try {
      setSubscribing(true);
      await subscribeDietPlan(plan.id);
      toast.success("Plano alimentar assinado com sucesso!");
      navigate("/dieta/meu-plano");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao assinar plano.");
    } finally {
      setSubscribing(false);
    }
  };

  // Determina o estado de inscrição em relação a este plano
  const isThisPlanActive =
    activePlan !== null &&
    activePlan.userDietPlanStatus === EUserDietPlanStatus.Active &&
    activePlan.dietPlanId === plan?.id;

  const hasDifferentActivePlan =
    activePlan !== null &&
    activePlan.userDietPlanStatus === EUserDietPlanStatus.Active &&
    activePlan.dietPlanId !== plan?.id;

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

  if (error || !plan) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error || "Plano não encontrado."}</p>
            </div>
            <button
              onClick={() => navigate("/dieta")}
              className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} /> Voltar aos planos
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/dieta")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Voltar aos planos
        </button>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold gradient-text">{plan.name}</h2>
              <p className="text-muted-foreground mt-1">{plan.description}</p>
            </div>

            {/* CTA — varia conforme o estado de inscrição */}
            {isThisPlanActive ? (
              <button
                onClick={() => navigate("/dieta/meu-plano")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ background: "var(--gradient-primary)" }}
              >
                <TrendingUp size={15} /> Ver meu progresso
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={subscribing || hasDifferentActivePlan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                style={{ background: "var(--gradient-primary)" }}
              >
                {subscribing ? "Assinando..." : "Assinar plano"}
              </button>
            )}
          </div>

          {/* Banner: plano diferente já ativo */}
          {hasDifferentActivePlan && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-400 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>
                Você já possui um plano alimentar ativo.{" "}
                <Link to="/dieta/meu-plano" className="underline font-medium">
                  Acesse e cancele o plano atual
                </Link>{" "}
                antes de assinar outro.
              </span>
            </div>
          )}

          {/* Banner: este é o plano ativo */}
          {isThisPlanActive && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle size={15} className="shrink-0" />
              <span>
                Você está inscrito neste plano.{" "}
                <button
                  onClick={() => navigate("/dieta/meu-plano")}
                  className="underline font-medium"
                >
                  Acompanhe seu progresso
                </button>
                .
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-1.5">
              <Target size={14} className="text-primary" />
              {dietObjectiveLabels[plan.objective]}
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart2 size={14} className="text-primary" />
              {dietLevelLabels[plan.level]}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              Mínimo {plan.minimumDurationDays} dias
            </span>
            <span className="flex items-center gap-1.5">
              <Utensils size={14} className="text-primary" />
              {plan.mealCount} refeições
            </span>
          </div>

          {plan.instructions && (
            <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Instruções</p>
              <p className="whitespace-pre-wrap">{plan.instructions}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Refeições do plano</h3>
          {plan.meals.map((meal) => (
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
                    <p className="text-xs text-muted-foreground">
                      {mealPeriodLabels[meal.period]} · {meal.items.length} itens
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {expandedMeal === meal.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedMeal === meal.id && (
                <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
                  {meal.instructions && (
                    <p className="text-xs text-muted-foreground italic mb-3">{meal.instructions}</p>
                  )}
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0"
                    >
                      <CheckCircle size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-primary">
                            {item.quantity} {item.unit}
                          </span>
                          {item.calories && (
                            <span className="text-xs text-muted-foreground">{item.calories} kcal</span>
                          )}
                          {item.protein && (
                            <span className="text-xs text-muted-foreground">Prot: {item.protein}g</span>
                          )}
                          {item.carbohydrates && (
                            <span className="text-xs text-muted-foreground">
                              Carb: {item.carbohydrates}g
                            </span>
                          )}
                          {item.fat && (
                            <span className="text-xs text-muted-foreground">Gord: {item.fat}g</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
