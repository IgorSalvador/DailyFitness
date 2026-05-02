import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
  CalendarDays,
  Users,
  ChevronRight,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  getChallenges,
  ChallengeDto,
  EChallengeType,
  EChallengeStatus,
  ChallengeTypeLabel,
  ChallengeStatusLabel,
} from "@/lib/challenges-api";

const AdminChallengesList = () => {
  const [challenges, setChallenges] = useState<ChallengeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getChallenges();
      if (res.success && res.data) {
        setChallenges(res.data);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar desafios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Gerenciar Desafios</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Administração completa dos desafios da plataforma
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
            <Link
              to="/desafios/admin/criar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Criar Desafio
            </Link>
          </div>
        </div>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando desafios...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro ao carregar desafios</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && challenges.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Nenhum desafio cadastrado
              </p>
              <p className="text-sm mt-1">
                Crie o primeiro desafio para os usuários da plataforma.
              </p>
            </div>
            <Link
              to="/desafios/admin/criar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 mt-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Desafio
            </Link>
          </div>
        )}

        {!loading && !error && challenges.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Desafio
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Participantes
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Data Limite
                  </th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {challenges.map((challenge) => (
                  <ChallengeRow key={challenge.id} challenge={challenge} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

// ── ChallengeRow ──────────────────────────────────────────────────────────────

interface ChallengeRowProps {
  challenge: ChallengeDto;
}

const typeColors: Record<EChallengeType, string> = {
  [EChallengeType.Daily]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [EChallengeType.Weekly]: "bg-primary/10 text-primary border-primary/30",
  [EChallengeType.Monthly]: "bg-accent/10 text-accent border-accent/30",
};

const challengeStatusStyles: Record<EChallengeStatus, string> = {
  [EChallengeStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EChallengeStatus.Closed]: "bg-secondary text-muted-foreground border-border",
  [EChallengeStatus.Discontinued]: "bg-destructive/10 text-destructive border-destructive/30",
};

const ChallengeRow = ({ challenge }: ChallengeRowProps) => {
  const endDate = new Date(challenge.expectedEndDate).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  return (
    <tr className="hover:bg-secondary/30 transition-colors group">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-foreground line-clamp-1">
            {challenge.name}
          </p>
          {challenge.isExpired && (
            <span className="text-xs text-destructive mt-0.5 block">
              Expirado
            </span>
          )}
          {/* Mobile: badges inline */}
          <div className="flex flex-wrap gap-1.5 mt-1.5 md:hidden">
            <span className={`px-2 py-0.5 rounded-full text-xs border ${typeColors[challenge.type]}`}>
              {ChallengeTypeLabel[challenge.type]}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs border ${challengeStatusStyles[challenge.challengeStatus]}`}>
              {ChallengeStatusLabel[challenge.challengeStatus]}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[challenge.type]}`}>
          {ChallengeTypeLabel[challenge.type]}
        </span>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${challengeStatusStyles[challenge.challengeStatus]}`}>
          {ChallengeStatusLabel[challenge.challengeStatus]}
        </span>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>
            {challenge.activeParticipantCount} ativo
            {challenge.activeParticipantCount !== 1 ? "s" : ""} / {challenge.participantCount} total
          </span>
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{endDate}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <Link
          to={`/desafios/admin/${challenge.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors"
        >
          Detalhes <ChevronRight className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
};

export default AdminChallengesList;
