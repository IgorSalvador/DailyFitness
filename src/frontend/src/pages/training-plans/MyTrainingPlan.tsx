import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
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
  getCurrentTrainingPlan,
  cancelTrainingPlan,
  markItemProgress,
  finishWorkoutDay,
  UserTrainingPlanDto,
  TrainingObjectiveLabel,
  TrainingLevelLabel,
  EUserTrainingPlanStatus,
} from "@/lib/training-plans-api";

const MyTrainingPlan = () => {
  const [utp, setUtp] = useState<UserTrainingPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingWorkoutFinish, setLoadingWorkoutFinish] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCurrentTrainingPlan();
      setUtp(res.data ?? null);
    } catch {
      setUtp(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Itens completados hoje neste plano (por workoutItem + workoutId)
  const completedTodaySet = new Set(
    (utp?.progresses ?? [])
      .filter((p) => p.progressDate.startsWith(todayDate))
      .map((p) => `${p.trainingWorkoutId}:${p.trainingWorkoutItemId}`)
  );

  const getDailyLog = (workoutId: string) =>
    utp?.dailyLogs.find(
      (l) => l.trainingWorkoutId === workoutId && l.progressDate.startsWith(todayDate)
    );

  const handleMarkItem = async (workoutId: string, itemId: string) => {
    const key = `${workoutId}:${itemId}`;
    if (completedTodaySet.has(key)) return;

    setLoadingItemId(key);
    try {
      const res = await markItemProgress(workoutId, itemId, {
        progressDate: todayDate,
      });
      setUtp(res.data!);
      toast.success("Exercício marcado como concluído!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar progresso.");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleFinishDay = async (workoutId: string) => {
    setLoadingWorkoutFinish(workoutId);
    try {
      await finishWorkoutDay(workoutId);
      toast.success("Treino do dia finalizado!");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao finalizar treino.");
    } finally {
      setLoadingWorkoutFinish(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar este plano de treino?")) return;
    setCancelling(true);
    try {
      await cancelTrainingPlan({});
      toast.success("Plano cancelado.", { description: "Você pode se inscrever em outro plano." });
      setUtp(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar plano.");
    } finally {
      setCancelling(false);
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

  if (!utp || utp.userTrainingPlanStatus !== EUserTrainingPlanStatus.Active) {
    return (
      <div className="min-h-screen px-4 md:px-[5%] py-5">
        <DashboardHeader />
        <main className="w-full max-w-3xl mx-auto pt-6 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold">Meu Plano de Treino</h2>
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum plano ativo</p>
              <p className="text-sm mt-1">Você não possui um plano de treino ativo no momento.</p>
            </div>
            <Link
              to="/treinos"
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

  const plan = utp.trainingPlan!;

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Meu Plano de Treino</h2>
            <p className="text-sm text-muted-foreground mt-1">Treino de hoje</p>
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
            <Link to="/treinos/historico" className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
              Histórico
            </Link>
          </div>
        </div>

        {/* Plan summary */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">{plan.name}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{TrainingObjectiveLabel[plan.objective]}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{TrainingLevelLabel[plan.level]}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Início: {new Date(utp.startedAt).toLocaleDateString("pt-BR")}</span>
            <span>Progresso geral: <span className="text-primary font-medium">{utp.overallProgressPercentage.toFixed(1)}%</span></span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-60"
          >
            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Cancelar inscrição
          </button>
        </div>

        {/* Workouts */}
        {plan.workouts.map((workout) => {
          const log = getDailyLog(workout.id);
          const isFinished = log?.isFinished ?? false;
          const progressPct = log?.progressPercentage ?? 0;
          const allCompleted = workout.items.filter(i => i.status === 1).every(
            (item) => completedTodaySet.has(`${workout.id}:${item.id}`)
          );

          return (
            <div key={workout.id} className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{workout.order}. {workout.name}</p>
                  {workout.description && <p className="text-xs text-muted-foreground mt-0.5">{workout.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  {isFinished ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✓ Concluído
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
                {workout.items.filter(i => i.status === 1).map((item) => {
                  const key = `${workout.id}:${item.id}`;
                  const done = completedTodaySet.has(key);
                  const isLoading = loadingItemId === key;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMarkItem(workout.id, item.id)}
                      disabled={done || isLoading || isFinished}
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
                        {(item.sets || item.repetitions) && (
                          <p className="text-xs text-primary mt-0.5">
                            {item.sets && `${item.sets}x`}{item.repetitions && ` ${item.repetitions} reps`}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Finish workout day */}
              {!isFinished && allCompleted && (
                <button
                  type="button"
                  onClick={() => handleFinishDay(workout.id)}
                  disabled={loadingWorkoutFinish === workout.id}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loadingWorkoutFinish === workout.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Finalizar Treino do Dia
                </button>
              )}
            </div>
          );
        })}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrainingPlan;
