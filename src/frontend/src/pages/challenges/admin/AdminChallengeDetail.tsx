import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trophy,
  Users,
  CalendarDays,
  TrendingUp,
  OctagonX,
  CheckCircle2,
  Edit3,
  X,
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
  getChallengeById,
  getChallengeParticipants,
  updateChallenge,
  discontinueChallenge,
  ChallengeDto,
  UserChallengeDto,
  EChallengeType,
  EChallengeStatus,
  EUserChallengeStatus,
  ChallengeTypeLabel,
  ChallengeStatusLabel,
  UserChallengeStatusLabel,
} from "@/lib/challenges-api";

const AdminChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [challenge, setChallenge] = useState<ChallengeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [participants, setParticipants] = useState<UserChallengeDto[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editType, setEditType] = useState<EChallengeType | "">("");
  const [editStatus, setEditStatus] = useState<EChallengeStatus | "">("");

  // Discontinue
  const [discontinueDialogOpen, setDiscontinueDialogOpen] = useState(false);
  const [discontinuing, setDiscontinuing] = useState(false);

  const loadChallenge = async () => {
    if (!id) { setError("ID não informado."); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const res = await getChallengeById(id);
      if (res.success && res.data) {
        setChallenge(res.data);
        populateEditForm(res.data);
      } else {
        setError(res.message || "Desafio não encontrado.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar desafio.");
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    if (!id) return;
    setLoadingParticipants(true);
    setParticipantsError("");
    try {
      const res = await getChallengeParticipants(id);
      if (res.success && res.data) {
        setParticipants(res.data);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      setParticipantsError(
        err instanceof Error ? err.message : "Erro ao carregar participantes."
      );
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    loadChallenge();
    loadParticipants();
  }, [id]);

  const populateEditForm = (c: ChallengeDto) => {
    setEditName(c.name);
    setEditDescription(c.description);
    setEditEndDate(c.expectedEndDate.split("T")[0]);
    setEditType(c.type);
    setEditStatus(c.challengeStatus);
  };

  const validateEdit = (): string[] => {
    const errs: string[] = [];
    if (!editName.trim()) errs.push("O nome é obrigatório.");
    else if (editName.trim().length < 5) errs.push("O nome deve ter no mínimo 5 caracteres.");
    else if (editName.trim().length > 100) errs.push("O nome deve ter no máximo 100 caracteres.");

    if (!editDescription.trim()) errs.push("A descrição é obrigatória.");
    else if (editDescription.trim().length < 50) errs.push("A descrição deve ter no mínimo 50 caracteres.");
    else if (editDescription.trim().length > 4000) errs.push("A descrição deve ter no máximo 4000 caracteres.");

    if (!editEndDate) errs.push("A data limite é obrigatória.");
    else if (new Date(editEndDate) <= new Date()) errs.push("A data limite deve ser uma data futura.");
    return errs;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !challenge) return;

    const clientErrors = validateEdit();
    if (clientErrors.length > 0) { setEditErrors(clientErrors); return; }
    setEditErrors([]);
    setSaving(true);

    try {
      const typeChanged = editType !== "" && editType !== challenge.type;

      const res = await updateChallenge(id, {
        name: editName.trim(),
        description: editDescription.trim(),
        expectedEndDate: new Date(editEndDate).toISOString(),
        type: typeChanged ? (editType as EChallengeType) : undefined,
        challengeStatus:
          editStatus !== "" && editStatus !== challenge.challengeStatus
            ? (editStatus as EChallengeStatus)
            : undefined,
      });

      if (!res.success) {
        const apiErrors = (res as unknown as { errors?: string[] }).errors;
        setEditErrors(
          apiErrors?.length ? apiErrors : [res.message || "Falha ao atualizar."]
        );
        return;
      }

      setChallenge(res.data!);
      populateEditForm(res.data!);
      setEditMode(false);
      toast.success("Desafio atualizado com sucesso!");
    } catch (err) {
      setEditErrors([err instanceof Error ? err.message : "Erro ao atualizar desafio."]);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscontinue = async () => {
    if (!id) return;
    setDiscontinuing(true);
    try {
      const res = await discontinueChallenge(id);
      if (!res.success) {
        throw new Error(res.message || "Falha ao descontinuar desafio.");
      }
      setChallenge(res.data!);
      setDiscontinueDialogOpen(false);
      toast.success("Desafio descontinuado.", {
        description: "Os participantes ativos foram notificados por e-mail.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao descontinuar desafio.");
    } finally {
      setDiscontinuing(false);
    }
  };

  const cancelEdit = () => {
    if (challenge) populateEditForm(challenge);
    setEditErrors([]);
    setEditMode(false);
  };

  const isDiscontinued =
    challenge?.challengeStatus === EChallengeStatus.Discontinued;
  const hasParticipants = participants.length > 0;
  const typeChangeLocked = hasParticipants;

  const minDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Link
          to="/desafios/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Gerenciar Desafios
        </Link>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando desafio...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Desafio não encontrado</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && challenge && (
          <>
            {/* ── Dados do Desafio ── */}
            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Trophy className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{challenge.name}</h2>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {challenge.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ChallengeStatusBadge status={challenge.challengeStatus} />
                  {challenge.isExpired && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-destructive/10 text-destructive border-destructive/30">
                      Expirado
                    </span>
                  )}
                </div>
              </div>

              {!editMode ? (
                <>
                  <div className="h-px bg-border" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoItem
                      icon={<Trophy className="w-4 h-4" />}
                      label="Tipo"
                      value={ChallengeTypeLabel[challenge.type]}
                    />
                    <InfoItem
                      icon={<CalendarDays className="w-4 h-4" />}
                      label="Data Limite"
                      value={new Date(challenge.expectedEndDate).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    />
                    <InfoItem
                      icon={<Users className="w-4 h-4" />}
                      label="Participantes"
                      value={`${challenge.activeParticipantCount} ativo${challenge.activeParticipantCount !== 1 ? "s" : ""} / ${challenge.participantCount} total`}
                    />
                    <InfoItem
                      icon={<CalendarDays className="w-4 h-4" />}
                      label="Criado em"
                      value={new Date(challenge.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    />
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                      Descrição
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {!isDiscontinued && (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar Desafio
                      </button>
                    )}
                    {!isDiscontinued && (
                      <button
                        type="button"
                        onClick={() => setDiscontinueDialogOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                      >
                        <OctagonX className="w-4 h-4" />
                        Descontinuar
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* ── Modo edição ── */
                <form onSubmit={handleSaveEdit} className="space-y-5">
                  <div className="h-px bg-border" />

                  {/* Nome */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                      Nome <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                      disabled={saving}
                      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
                    />
                    <span className="text-xs text-muted-foreground text-right block mt-1">
                      {editName.length}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                        Tipo
                      </label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(Number(e.target.value) as EChallengeType)}
                        disabled={saving || typeChangeLocked}
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
                      >
                        {(Object.values(EChallengeType).filter((v) => typeof v === "number") as EChallengeType[]).map(
                          (t) => (
                            <option key={t} value={t}>
                              {ChallengeTypeLabel[t]}
                            </option>
                          )
                        )}
                      </select>
                      {typeChangeLocked && (
                        <p className="text-xs text-orange-400 mt-1">
                          Tipo bloqueado: desafio possui participantes.
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as EChallengeStatus)}
                        disabled={saving}
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
                      >
                        {(Object.values(EChallengeStatus).filter((v) => typeof v === "number") as EChallengeStatus[]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {ChallengeStatusLabel[s]}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Data Limite */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                      Data Limite <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      min={minDateStr}
                      disabled={saving}
                      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                      Descrição <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={6}
                      maxLength={4000}
                      disabled={saving}
                      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60 resize-none"
                    />
                    <span className="text-xs text-muted-foreground text-right block mt-1">
                      {editDescription.length}/4000
                    </span>
                  </div>

                  {editErrors.length > 0 && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">Corrija os erros:</span>
                      </div>
                      {editErrors.map((err, i) => (
                        <p key={i} className="text-sm text-destructive pl-6">
                          • {err}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Salvar Alterações</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Participantes ── */}
            <div className="glass-card rounded-2xl p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  Participantes ({participants.length})
                </h3>
              </div>

              {loadingParticipants && (
                <div className="flex items-center gap-3 text-muted-foreground py-6 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Carregando participantes...</span>
                </div>
              )}

              {!loadingParticipants && participantsError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {participantsError}
                </div>
              )}

              {!loadingParticipants && !participantsError && participants.length === 0 && (
                <div className="rounded-xl bg-secondary/40 py-8 flex flex-col items-center gap-2 text-muted-foreground">
                  <Users className="w-6 h-6" />
                  <p className="text-sm">Nenhum participante ainda.</p>
                </div>
              )}

              {!loadingParticipants && !participantsError && participants.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Participante
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                          Progresso
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                          Entrou em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {participants.map((p) => (
                        <ParticipantRow key={p.id} participation={p} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Dialog Confirmar Descontinuação ── */}
      <Dialog
        open={discontinueDialogOpen}
        onOpenChange={setDiscontinueDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Descontinuar desafio?</DialogTitle>
            <DialogDescription>
              O desafio &quot;{challenge?.name}&quot; será descontinuado.
              Todos os{" "}
              <strong>{challenge?.activeParticipantCount} participante{challenge?.activeParticipantCount !== 1 ? "s" : ""} ativo{challenge?.activeParticipantCount !== 1 ? "s" : ""}</strong>{" "}
              serão notificados por e-mail. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setDiscontinueDialogOpen(false)}
              disabled={discontinuing}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDiscontinue}
              disabled={discontinuing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-60"
            >
              {discontinuing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Descontinuando...</>
              ) : (
                <><OctagonX className="w-4 h-4" /> Confirmar</>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Sub-componentes ────────────────────────────────────────────────────────────

const challengeStatusStyles: Record<EChallengeStatus, string> = {
  [EChallengeStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EChallengeStatus.Closed]: "bg-secondary text-muted-foreground border-border",
  [EChallengeStatus.Discontinued]: "bg-destructive/10 text-destructive border-destructive/30",
};

const ChallengeStatusBadge = ({ status }: { status: EChallengeStatus }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${challengeStatusStyles[status]}`}>
    {ChallengeStatusLabel[status]}
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

const participationStatusStyles: Record<EUserChallengeStatus, string> = {
  [EUserChallengeStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EUserChallengeStatus.Completed]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [EUserChallengeStatus.Abandoned]: "bg-secondary text-muted-foreground border-border",
  [EUserChallengeStatus.Discontinued]: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  [EUserChallengeStatus.Expired]: "bg-destructive/10 text-destructive border-destructive/30",
};

const ParticipantRow = ({ participation: p }: { participation: UserChallengeDto }) => (
  <tr className="hover:bg-secondary/20 transition-colors">
    <td className="px-4 py-3">
      <p className="text-sm font-medium text-foreground">{p.userFullName || "—"}</p>
    </td>
    <td className="px-4 py-3 hidden sm:table-cell">
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${participationStatusStyles[p.userChallengeStatus]}`}>
        {UserChallengeStatusLabel[p.userChallengeStatus]}
      </span>
    </td>
    <td className="px-4 py-3 hidden md:table-cell">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>{p.currentProgress.toLocaleString("pt-BR")}</span>
      </div>
    </td>
    <td className="px-4 py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>
          {new Date(p.joinedAt).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "short", year: "numeric",
          })}
        </span>
      </div>
    </td>
  </tr>
);

export default AdminChallengeDetail;
