import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Dumbbell,
  Users,
  CheckCircle2,
  XCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import { getUser } from "@/lib/auth";
import {
  adminGetTrainingPlan,
  adminActivateTrainingPlan,
  adminDeactivateTrainingPlan,
  adminGetPlanSubscribers,
  profGetManagedPlan,
  profActivateManagedPlan,
  profDeactivateManagedPlan,
  profGetManagedPlanSubscribers,
  TrainingPlanDto,
  TrainingPlanSubscriberDto,
  EUserTrainingPlanStatus,
  UserTrainingPlanStatusLabel,
  TrainingObjectiveLabel,
  TrainingLevelLabel,
} from "@/lib/training-plans-api";

const subscriberStatusStyles: Record<EUserTrainingPlanStatus, string> = {
  [EUserTrainingPlanStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EUserTrainingPlanStatus.Cancelled]: "bg-secondary text-muted-foreground border-border",
  [EUserTrainingPlanStatus.Completed]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const ManagementTrainingPlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const baseRoute = isAdmin ? "/treinos/gestao" : "/treinos/profissional";

  const [plan, setPlan] = useState<TrainingPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [subscribers, setSubscribers] = useState<TrainingPlanSubscriberDto[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscribersError, setSubscribersError] = useState("");

  const [toggling, setToggling] = useState(false);

  const [showWorkouts, setShowWorkouts] = useState(false);

  const loadPlan = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = isAdmin
        ? await adminGetTrainingPlan(id)
        : await profGetManagedPlan(id);
      if (res.data) {
        setPlan(res.data);
      } else {
        setError("Plano não encontrado.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar plano.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    if (!id) return;
    setLoadingSubscribers(true);
    setSubscribersError("");
    try {
      const res = isAdmin
        ? await adminGetPlanSubscribers(id)
        : await profGetManagedPlanSubscribers(id);
      setSubscribers(res.data ?? []);
    } catch (err) {
      setSubscribersError(
        err instanceof Error ? err.message : "Erro ao carregar inscritos."
      );
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    loadPlan();
    loadSubscribers();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!id || !plan) return;
    setToggling(true);
    try {
      const isActive = plan.status === 1;
      const res = isActive
        ? isAdmin
          ? await adminDeactivateTrainingPlan(id)
          : await profDeactivateManagedPlan(id)
        : isAdmin
        ? await adminActivateTrainingPlan(id)
        : await profActivateManagedPlan(id);

      setPlan(res.data!);
      toast.success(
        res.data!.status === 1
          ? "Plano ativado. Agora está disponível para inscrições."
          : "Plano desativado. Não aparecerá para novos usuários."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao alterar status do plano."
      );
    } finally {
      setToggling(false);
    }
  };

  const isActive = plan?.status === 1;
  const activeSubscribers = subscribers.filter(
    (s) => s.status === EUserTrainingPlanStatus.Active
  );

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Link
          to={baseRoute}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {isAdmin ? "Gerenciar Planos" : "Meus Planos"}
        </Link>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando plano...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && plan && (
          <>
            {/* ── Dados do Plano ── */}
            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Dumbbell className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {plan.id}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {isActive ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="h-px bg-border" />

              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem
                  icon={<Dumbbell className="w-4 h-4" />}
                  label="Objetivo"
                  value={TrainingObjectiveLabel[plan.objective]}
                />
                <InfoItem
                  icon={<Dumbbell className="w-4 h-4" />}
                  label="Nível"
                  value={TrainingLevelLabel[plan.level]}
                />
                <InfoItem
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Duração Mín."
                  value={`${plan.minimumDurationDays} dias`}
                />
                <InfoItem
                  icon={<Users className="w-4 h-4" />}
                  label="Inscritos"
                  value={`${plan.activeSubscriberCount} ativo${plan.activeSubscriberCount !== 1 ? "s" : ""} / ${plan.subscriberCount} total`}
                />
              </div>

              {/* Descrição */}
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Descrição
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {plan.instructions && (
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                    Instruções
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {plan.instructions}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to={`${baseRoute}/${plan.id}/editar`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Plano
                </Link>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 ${
                    isActive
                      ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                      : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  }`}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isActive ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isActive ? "Desativar Plano" : "Ativar Plano"}
                </button>
              </div>
            </div>

            {/* ── Treinos ── */}
            {plan.workouts && plan.workouts.length > 0 && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowWorkouts((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                      Treinos ({plan.workouts.length})
                    </span>
                  </div>
                  {showWorkouts ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {showWorkouts && (
                  <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
                    {plan.workouts
                      .sort((a, b) => a.order - b.order)
                      .map((workout) => (
                        <div
                          key={workout.id}
                          className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {workout.order}. {workout.name}
                            </p>
                            {workout.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {workout.description}
                              </p>
                            )}
                          </div>
                          {workout.items && workout.items.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-border/60">
                              {workout.items
                                .filter((i) => i.status === 1)
                                .sort((a, b) => a.order - b.order)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-start gap-2 text-xs text-muted-foreground"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary/50 mt-0.5 shrink-0" />
                                    <div>
                                      <span className="text-foreground font-medium">
                                        {item.name}
                                      </span>
                                      {(item.sets || item.repetitions) && (
                                        <span className="ml-2 text-primary">
                                          {item.sets && `${item.sets} séries`}
                                          {item.sets && item.repetitions && " × "}
                                          {item.repetitions && `${item.repetitions} reps`}
                                        </span>
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
              </div>
            )}

            {/* ── Inscritos ── */}
            <div className="glass-card rounded-2xl p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  Inscritos ({subscribers.length})
                </h3>
                {activeSubscribers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {activeSubscribers.length} ativo{activeSubscribers.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {loadingSubscribers && (
                <div className="flex items-center gap-3 text-muted-foreground py-6 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Carregando inscritos...</span>
                </div>
              )}

              {!loadingSubscribers && subscribersError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {subscribersError}
                </div>
              )}

              {!loadingSubscribers && !subscribersError && subscribers.length === 0 && (
                <div className="rounded-xl bg-secondary/40 py-8 flex flex-col items-center gap-2 text-muted-foreground">
                  <Users className="w-6 h-6" />
                  <p className="text-sm">Nenhum inscrito ainda.</p>
                </div>
              )}

              {!loadingSubscribers && !subscribersError && subscribers.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Usuário
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                          Progresso
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                          Início
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subscribers.map((s) => (
                        <SubscriberRow key={s.userTrainingPlanId} subscriber={s} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      {icon}
      <span className="font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm text-foreground font-medium">{value}</p>
  </div>
);

const SubscriberRow = ({
  subscriber: s,
}: {
  subscriber: TrainingPlanSubscriberDto;
}) => (
  <tr className="hover:bg-secondary/20 transition-colors">
    <td className="px-4 py-3">
      <p className="text-sm font-medium text-foreground">{s.userFullName || "—"}</p>
    </td>
    <td className="px-4 py-3 hidden sm:table-cell">
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${subscriberStatusStyles[s.status]}`}
      >
        {UserTrainingPlanStatusLabel[s.status]}
      </span>
    </td>
    <td className="px-4 py-3 hidden md:table-cell">
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-primary font-medium">
          {s.overallProgressPercentage.toFixed(1)}%
        </span>
      </div>
    </td>
    <td className="px-4 py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>
          {new Date(s.startedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </td>
  </tr>
);

export default ManagementTrainingPlanDetail;
