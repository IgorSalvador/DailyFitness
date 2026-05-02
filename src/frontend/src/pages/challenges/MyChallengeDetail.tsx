import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trophy,
  CalendarDays,
  TrendingUp,
  ClipboardList,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardHeader from "@/components/DashboardHeader";
import {
  getMyChallengeDetails,
  updateProgress,
  leaveChallenge,
  UserChallengeDto,
  UserChallengeProgressDto,
  EChallengeType,
  EUserChallengeStatus,
  ChallengeTypeLabel,
  UserChallengeStatusLabel,
} from "@/lib/challenges-api";

const MyChallengeDetail = () => {
  const { userChallengeId } = useParams<{ userChallengeId: string }>();

  const [participation, setParticipation] = useState<UserChallengeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // progress form
  const [progressValue, setProgressValue] = useState("");
  const [notes, setNotes] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressError, setProgressError] = useState("");

  // leave dialog
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const load = async () => {
    if (!userChallengeId) {
      setError("ID da participação não informado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getMyChallengeDetails(userChallengeId);
      if (res.success && res.data) {
        setParticipation(res.data);
      } else {
        setError(res.message || "Participação não encontrada.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar participação."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userChallengeId]);

  const isActive =
    participation?.userChallengeStatus === EUserChallengeStatus.Active;

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChallengeId || !participation) return;

    const value = parseFloat(progressValue);
    if (!progressValue || isNaN(value) || value <= 0) {
      setProgressError("O valor do progresso deve ser maior que zero.");
      return;
    }
    if (notes.length > 500) {
      setProgressError("As notas devem ter no máximo 500 caracteres.");
      return;
    }

    setProgressError("");
    setSavingProgress(true);
    try {
      const res = await updateProgress(userChallengeId, {
        progressValue: value,
        notes: notes.trim() || undefined,
      });
      if (!res.success) {
        throw new Error(res.message || "Falha ao salvar progresso.");
      }
      setParticipation(res.data!);
      setProgressValue("");
      setNotes("");
      toast.success("Progresso salvo!", {
        description: "Seu progresso foi atualizado com sucesso.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar progresso."
      );
    } finally {
      setSavingProgress(false);
    }
  };

  const handleLeave = async () => {
    if (!userChallengeId) return;
    setLeaving(true);
    try {
      const res = await leaveChallenge(userChallengeId);
      if (!res.success) {
        throw new Error(res.message || "Falha ao sair do desafio.");
      }
      setParticipation(res.data!);
      setLeaveDialogOpen(false);
      toast.success("Você saiu do desafio.", {
        description: "Seu histórico de progresso foi preservado.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao sair do desafio."
      );
    } finally {
      setLeaving(false);
    }
  };

  const getCurrentPeriodLabel = (type: EChallengeType): string => {
    const now = new Date();
    if (type === EChallengeType.Daily) {
      return `Hoje: ${now.toLocaleDateString("pt-BR")}`;
    }
    if (type === EChallengeType.Weekly) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      return `Semana de ${startOfWeek.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
    }
    return now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Link
          to="/desafios/meus"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Meus Desafios
        </Link>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando participação...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Participação não encontrada</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && participation && (
          <>
            {/* ── Header do desafio ── */}
            <div className="glass-card rounded-2xl p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Trophy className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {participation.challengeName}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ChallengeTypeLabel[participation.challengeType]}
                    </p>
                  </div>
                </div>
                <StatusBadge status={participation.userChallengeStatus} />
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoItem
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Entrou em"
                  value={new Date(participation.joinedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                />
                <InfoItem
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Data limite"
                  value={new Date(participation.challengeExpectedEndDate).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                />
                <InfoItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Progresso acumulado"
                  value={participation.currentProgress.toLocaleString("pt-BR")}
                />
                {participation.lastProgressUpdateAt && (
                  <InfoItem
                    icon={<CalendarDays className="w-4 h-4" />}
                    label="Última atualização"
                    value={new Date(participation.lastProgressUpdateAt).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  />
                )}
              </div>

              {isActive && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setLeaveDialogOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair do Desafio
                  </button>
                </div>
              )}
            </div>

            {/* ── Form de progresso (somente se ativo) ── */}
            {isActive && (
              <div className="glass-card rounded-2xl p-8 space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">Registrar Progresso</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Período atual: {getCurrentPeriodLabel(participation.challengeType)}
                  </p>
                </div>

                <form onSubmit={handleSaveProgress} className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                      Valor do progresso <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={progressValue}
                      onChange={(e) => setProgressValue(e.target.value)}
                      placeholder="Ex: 30"
                      disabled={savingProgress}
                      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Insira o valor acumulado do período (ex: minutos, km, repetições).
                      Registros anteriores do mesmo período serão atualizados.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                      Observações{" "}
                      <span className="text-muted-foreground/60">(opcional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Como foi sua atividade hoje?"
                      rows={3}
                      maxLength={500}
                      disabled={savingProgress}
                      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60 resize-none"
                    />
                    <span className="text-xs text-muted-foreground mt-1 block text-right">
                      {notes.length}/500
                    </span>
                  </div>

                  {progressError && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{progressError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingProgress || !progressValue}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingProgress ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Salvar Progresso
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── Histórico de progresso ── */}
            <div className="glass-card rounded-2xl p-8 space-y-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Histórico de Progresso</h3>
              </div>

              {participation.progresses.length === 0 ? (
                <div className="rounded-xl bg-secondary/40 px-4 py-8 flex flex-col items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-6 h-6" />
                  <p className="text-sm text-center">
                    Nenhum progresso registrado ainda. Comece agora!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...participation.progresses]
                    .sort(
                      (a, b) =>
                        new Date(b.referenceDate).getTime() -
                        new Date(a.referenceDate).getTime()
                    )
                    .map((prog) => (
                      <ProgressItem key={prog.id} progress={prog} />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Dialog Confirmação: Sair ── */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sair do desafio?</DialogTitle>
            <DialogDescription>
              Você será removido do desafio &quot;
              {participation?.challengeName}&quot;. Seu histórico de progresso
              será preservado, mas você não poderá mais registrar novos
              progressos. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setLeaveDialogOpen(false)}
              disabled={leaving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleLeave}
              disabled={leaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-60"
            >
              {leaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saindo...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Confirmar saída
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Sub-componentes ────────────────────────────────────────────────────────────

const statusStyles: Record<EUserChallengeStatus, string> = {
  [EUserChallengeStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EUserChallengeStatus.Completed]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [EUserChallengeStatus.Abandoned]: "bg-secondary text-muted-foreground border-border",
  [EUserChallengeStatus.Discontinued]: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  [EUserChallengeStatus.Expired]: "bg-destructive/10 text-destructive border-destructive/30",
};

const StatusBadge = ({ status }: { status: EUserChallengeStatus }) => (
  <span
    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 ${statusStyles[status]}`}
  >
    {UserChallengeStatusLabel[status]}
  </span>
);

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      {icon}
      <span className="font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm text-foreground font-medium">{value}</p>
  </div>
);

const ProgressItem = ({ progress }: { progress: UserChallengeProgressDto }) => (
  <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 flex items-start justify-between gap-4">
    <div className="space-y-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded-md text-muted-foreground">
          {progress.referencePeriod}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(progress.referenceDate).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      {progress.notes && (
        <p className="text-xs text-muted-foreground truncate">{progress.notes}</p>
      )}
    </div>
    <span className="text-sm font-semibold text-foreground shrink-0">
      {progress.progressValue.toLocaleString("pt-BR")}
    </span>
  </div>
);

export default MyChallengeDetail;
