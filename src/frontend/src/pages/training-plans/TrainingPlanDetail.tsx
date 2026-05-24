import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Dumbbell, Loader2, AlertCircle, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import {
  getTrainingPlanDetail,
  subscribeTrainingPlan,
  getCurrentTrainingPlan,
  TrainingPlanDto,
  TrainingObjectiveLabel,
  TrainingLevelLabel,
} from "@/lib/training-plans-api";

const TrainingPlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<TrainingPlanDto | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [planRes, currentRes] = await Promise.allSettled([
          getTrainingPlanDetail(id!),
          getCurrentTrainingPlan(),
        ]);

        if (planRes.status === "fulfilled" && planRes.value.data) {
          setPlan(planRes.value.data);
        } else {
          setError("Plano não encontrado.");
        }

        if (currentRes.status === "fulfilled" && currentRes.value.data) {
          setHasActivePlan(true);
        }
      } catch {
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const handleSubscribe = async () => {
    if (!plan) return;
    setSubscribing(true);
    try {
      await subscribeTrainingPlan(plan.id);
      toast.success("Inscrição realizada!", {
        description: `Você se inscreveu no plano "${plan.name}".`,
      });
      navigate("/treinos/meu-plano");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao se inscrever.");
    } finally {
      setSubscribing(false);
    }
  };

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

  if (error || !plan) {
    return (
      <div className="min-h-screen px-4 md:px-[5%] py-5">
        <DashboardHeader />
        <main className="w-full max-w-3xl mx-auto pt-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error || "Plano não encontrado."}</p>
            </div>
            <Link to="/treinos" className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" /> Voltar aos planos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Back */}
        <Link to="/treinos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar aos planos
        </Link>

        {/* Plan Header */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs border bg-primary/10 text-primary border-primary/30">
                  {TrainingObjectiveLabel[plan.objective]}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs border bg-secondary text-muted-foreground border-border">
                  {TrainingLevelLabel[plan.level]}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs border bg-secondary text-muted-foreground border-border">
                  ⏱ {plan.minimumDurationDays} dias mín.
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>

          {plan.instructions && (
            <div className="rounded-xl bg-secondary/50 border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Instruções</p>
              <p className="text-sm text-foreground">{plan.instructions}</p>
            </div>
          )}

          {/* Subscription CTA */}
          {hasActivePlan ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Você já possui um plano de treino ativo.{" "}
                <Link to="/treinos/meu-plano" className="underline">
                  Acesse e cancele o plano atual
                </Link>{" "}
                antes de se inscrever em outro.
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {subscribing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Inscrevendo...</>
              ) : (
                "Inscrever-se neste plano"
              )}
            </button>
          )}
        </div>

        {/* Workouts */}
        {plan.workouts && plan.workouts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Treinos do Plano</h3>
            {plan.workouts.map((workout) => (
              <div key={workout.id} className="glass-card rounded-xl p-5 space-y-3">
                <div>
                  <p className="font-medium text-sm">
                    {workout.order}. {workout.name}
                  </p>
                  {workout.description && (
                    <p className="text-xs text-muted-foreground mt-1">{workout.description}</p>
                  )}
                  {workout.instructions && (
                    <p className="text-xs text-primary/80 mt-1 italic">{workout.instructions}</p>
                  )}
                </div>

                {workout.items && workout.items.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    {workout.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary/50 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-foreground font-medium">{item.name}</span>
                          {(item.sets || item.repetitions) && (
                            <span className="ml-2 text-primary">
                              {item.sets && `${item.sets} séries`}
                              {item.sets && item.repetitions && " × "}
                              {item.repetitions && `${item.repetitions} reps`}
                            </span>
                          )}
                          {item.instructions && (
                            <p className="mt-0.5 italic">{item.instructions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainingPlanDetail;
