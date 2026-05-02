import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, ClipboardList, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getAllProfessionalRequests, ProfessionalRequestDto, EProfessionalRequestStatus, ProfessionalRequestStatusLabel } from "@/lib/professionals-api";

const statusIcon: Record<EProfessionalRequestStatus, React.ReactNode> = {
  [EProfessionalRequestStatus.Pending]: <Clock className="w-4 h-4 text-yellow-400" />,
  [EProfessionalRequestStatus.Approved]: <CheckCircle2 className="w-4 h-4 text-primary" />,
  [EProfessionalRequestStatus.Rejected]: <XCircle className="w-4 h-4 text-destructive" />,
};

const statusStyle: Record<EProfessionalRequestStatus, string> = {
  [EProfessionalRequestStatus.Pending]: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  [EProfessionalRequestStatus.Approved]: "bg-primary/10 text-primary border-primary/30",
  [EProfessionalRequestStatus.Rejected]: "bg-destructive/10 text-destructive border-destructive/30",
};

const ProfessionalRequestsList = () => {
  const [requests, setRequests] = useState<ProfessionalRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await getAllProfessionalRequests();
      if (res.success && res.data) { setRequests(res.data); } else { setRequests([]); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar solicitações.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pending = requests.filter((r) => r.professionalRequestStatus === EProfessionalRequestStatus.Pending);
  const others = requests.filter((r) => r.professionalRequestStatus !== EProfessionalRequestStatus.Pending);

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link to="/profissionais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <button type="button" onClick={load} disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Solicitações de Profissional</h2>
          <p className="text-sm text-muted-foreground mt-1">Avalie as solicitações de usuários para se tornarem profissionais</p>
        </div>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" /><p className="text-sm">Carregando solicitações...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div><p className="font-medium">Erro ao carregar solicitações</p><p className="opacity-90">{error}</p></div>
            </div>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhuma solicitação encontrada</p>
              <p className="text-sm mt-1">Não há solicitações de profissional no momento.</p>
            </div>
          </div>
        )}

        {!loading && !error && pending.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Pendentes ({pending.length})
            </h3>
            <div className="space-y-3">
              {pending.map((req) => <RequestRow key={req.id} request={req} statusIcon={statusIcon} statusStyle={statusStyle} />)}
            </div>
          </section>
        )}

        {!loading && !error && others.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 mt-4">
              Avaliadas ({others.length})
            </h3>
            <div className="space-y-3">
              {others.map((req) => <RequestRow key={req.id} request={req} statusIcon={statusIcon} statusStyle={statusStyle} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

interface RequestRowProps {
  request: ProfessionalRequestDto;
  statusIcon: Record<EProfessionalRequestStatus, React.ReactNode>;
  statusStyle: Record<EProfessionalRequestStatus, string>;
}

const RequestRow = ({ request, statusIcon, statusStyle }: RequestRowProps) => {
  const status = request.professionalRequestStatus as EProfessionalRequestStatus;
  const label = ProfessionalRequestStatusLabel[status] ?? "—";
  const formattedDate = request.evaluatedOn ? new Date(request.evaluatedOn).toLocaleDateString("pt-BR") : null;

  return (
    <Link to={`/profissionais/admin/solicitacoes/${request.id}`}
      className="glass-card rounded-xl px-5 py-4 flex items-center justify-between gap-4 group hover:border-primary/30 transition-all duration-200">
      <div className="flex items-center gap-4 min-w-0">
        {statusIcon[status]}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{request.specialization || "Especialização não informada"}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {request.biography?.slice(0, 80)}{(request.biography?.length ?? 0) > 80 ? "..." : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {formattedDate && <span className="text-xs text-muted-foreground hidden sm:block">{formattedDate}</span>}
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle[status]}`}>{label}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
};

export default ProfessionalRequestsList;
