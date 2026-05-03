import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Clock,
  BookOpen, Briefcase, Tag, MessageSquare, User2, CalendarDays, Mail,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  getProfessionalRequestById, evaluateProfessionalRequest,
  ProfessionalRequestDto, EProfessionalRequestStatus, ProfessionalRequestStatusLabel,
} from "@/lib/professionals-api";

const ProfessionalRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ProfessionalRequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState("");
  const [evalSuccess, setEvalSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) { setError("ID da solicitação não informado."); setLoading(false); return; }
      setLoading(true); setError("");
      try {
        const res = await getProfessionalRequestById(id);
        if (res.success && res.data) { setRequest(res.data); }
        else { setError(res.message || "Solicitação não encontrada."); }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar solicitação.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const isPending = request?.professionalRequestStatus === EProfessionalRequestStatus.Pending;

  const handleEvaluate = async () => {
    if (isApproved === null || !id) return;
    setEvalError(""); setEvalSuccess("");
    if (!isApproved && !comments.trim()) {
      setEvalError("O comentário é obrigatório quando a solicitação for reprovada."); return;
    }
    if (comments.length > 2000) {
      setEvalError("Comentário não pode ter mais que 2000 caracteres."); return;
    }
    setShowConfirm(false); setEvaluating(true);
    try {
      const res = await evaluateProfessionalRequest({
        professionalRequestId: id, isApproved, comments: comments.trim() || undefined,
      });
      if (!res.success) throw new Error(res.message || "Falha ao avaliar solicitação.");
      setEvalSuccess(isApproved ? "Solicitação aprovada com sucesso!" : "Solicitação reprovada com sucesso.");
      if (res.data) setRequest(res.data);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : "Erro ao avaliar solicitação.");
    } finally { setEvaluating(false); }
  };

  const statusConfig: Record<EProfessionalRequestStatus, { label: string; icon: React.ReactNode; style: string }> = {
    [EProfessionalRequestStatus.Pending]: {
      label: ProfessionalRequestStatusLabel[EProfessionalRequestStatus.Pending],
      icon: <Clock className="w-4 h-4" />,
      style: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    },
    [EProfessionalRequestStatus.Approved]: {
      label: ProfessionalRequestStatusLabel[EProfessionalRequestStatus.Approved],
      icon: <CheckCircle2 className="w-4 h-4" />,
      style: "bg-primary/10 text-primary border-primary/30",
    },
    [EProfessionalRequestStatus.Rejected]: {
      label: ProfessionalRequestStatusLabel[EProfessionalRequestStatus.Rejected],
      icon: <XCircle className="w-4 h-4" />,
      style: "bg-destructive/10 text-destructive border-destructive/30",
    },
  };

  const currentStatus = request?.professionalRequestStatus != null
    ? (request.professionalRequestStatus as EProfessionalRequestStatus) : null;
  const statusInfo = currentStatus != null ? statusConfig[currentStatus] : null;

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Link to="/profissionais/admin/solicitacoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Solicitações
        </Link>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" /><p className="text-sm">Carregando solicitação...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div><p className="font-medium">Solicitação não encontrada</p><p className="opacity-90">{error}</p></div>
            </div>
          </div>
        )}

        {!loading && !error && request && (
          <>
            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Solicitação de Profissional</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{request.id}</p>
                </div>
                {statusInfo && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border shrink-0 ${statusInfo.style}`}>
                    {statusInfo.icon}{statusInfo.label}
                  </span>
                )}
              </div>

              <div className="h-px bg-border" />

              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Solicitante</p>
                <div className="flex items-center gap-2 text-sm">
                  <User2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">{request.userName || "Não identificado"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{request.userEmail}</span>
                </div>
              </div>

              <InfoSection icon={<Briefcase className="w-4 h-4" />} title="Especialização" content={request.specialization || "Não informado"} />
              <InfoSection icon={<BookOpen className="w-4 h-4" />} title="Biografia" content={request.biography || "Não informado"} multiline />

              {request.skills && request.skills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium uppercase tracking-wide">Competências</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!isPending && (
                <>
                  <div className="h-px bg-border" />
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resultado da Avaliação</h3>
                    {request.evaluatorFullName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User2 className="w-4 h-4" /><span>Avaliado por: </span>
                        <span className="text-foreground">{request.evaluatorFullName}</span>
                      </div>
                    )}
                    {request.evaluatedOn && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4" /><span>Em: </span>
                        <span className="text-foreground">{new Date(request.evaluatedOn).toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                    {request.evaluationComments && (
                      <InfoSection icon={<MessageSquare className="w-4 h-4" />} title="Comentários" content={request.evaluationComments} multiline />
                    )}
                  </div>
                </>
              )}
            </div>

            {isPending && (
              <div className="glass-card rounded-2xl p-8 space-y-5">
                <h3 className="text-lg font-semibold">Avaliar Solicitação</h3>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setIsApproved(true)} disabled={evaluating}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${
                      isApproved === true ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    }`}>
                    <CheckCircle2 className="w-4 h-4" /> Aprovar
                  </button>
                  <button type="button" onClick={() => setIsApproved(false)} disabled={evaluating}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${
                      isApproved === false ? "bg-destructive/20 border-destructive text-destructive" : "border-border text-muted-foreground hover:text-foreground hover:border-destructive/50"
                    }`}>
                    <XCircle className="w-4 h-4" /> Reprovar
                  </button>
                </div>

                <label className="block">
                  <span className="block text-xs text-muted-foreground mb-1.5">
                    Comentários{isApproved === false && <span className="text-destructive ml-1">*</span>}
                    {isApproved === false && <span className="ml-1 text-muted-foreground/60">(obrigatório ao reprovar)</span>}
                  </span>
                  <textarea value={comments} onChange={(e) => setComments(e.target.value)}
                    placeholder="Adicione um comentário para o solicitante..." disabled={evaluating} rows={4} maxLength={2000}
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60 resize-none" />
                  <span className="text-xs text-muted-foreground mt-1 block text-right">{comments.length}/2000</span>
                </label>

                {evalError && !evalSuccess && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{evalError}</span>
                  </div>
                )}
                {evalSuccess && (
                  <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" /><span>{evalSuccess}</span>
                  </div>
                )}

                {!evalSuccess && (
                  <>
                    {!showConfirm ? (
                      <button type="button" disabled={isApproved === null || evaluating}
                        onClick={() => {
                          setEvalError("");
                          if (!isApproved && !comments.trim()) {
                            setEvalError("O comentário é obrigatório quando a solicitação for reprovada."); return;
                          }
                          setShowConfirm(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
                        style={{ background: "var(--gradient-primary)" }}>
                        Confirmar avaliação
                      </button>
                    ) : (
                      <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
                        <p className="text-sm text-foreground">
                          Deseja realmente <strong>{isApproved ? "aprovar" : "reprovar"}</strong> esta solicitação? Essa ação não pode ser desfeita.
                        </p>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={handleEvaluate} disabled={evaluating}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
                            style={{ background: "var(--gradient-primary)" }}>
                            {evaluating && <Loader2 className="w-4 h-4 animate-spin" />}
                            {evaluating ? "Salvando..." : "Confirmar"}
                          </button>
                          <button type="button" onClick={() => setShowConfirm(false)} disabled={evaluating}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

interface InfoSectionProps { icon: React.ReactNode; title: string; content: string; multiline?: boolean; }

const InfoSection = ({ icon, title, content, multiline = false }: InfoSectionProps) => (
  <div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
      {icon}<span className="font-medium uppercase tracking-wide">{title}</span>
    </div>
    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
      <p className={`text-sm text-foreground ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}>{content}</p>
    </div>
  </div>
);

export default ProfessionalRequestDetail;
