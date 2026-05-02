import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  ChevronRight,
  Settings2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import { getUser } from "@/lib/auth";
import {
  getAvailableChallenges,
  joinChallenge,
  ChallengeDto,
  EChallengeType,
  ChallengeTypeLabel,
} from "@/lib/challenges-api";

const ChallengesList = () => {
  const user = getUser();
  const isAdmin = user?.role === "Administrator";

  const [challenges, setChallenges] = useState<ChallengeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAvailableChallenges();
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

  const handleJoin = async (challenge: ChallengeDto) => {
    setJoiningId(challenge.id);
    try {
      const res = await joinChallenge(challenge.id);
      if (!res.success) {
        throw new Error(res.message || "Falha ao participar do desafio.");
      }
      toast.success("Participação registrada!", {
        description: `Você entrou no desafio "${challenge.name}".`,
      });
      setChallenges((prev) => prev.filter((c) => c.id !== challenge.id));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao participar do desafio."
      );
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Desafios</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Desafios disponíveis para você participar
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
              to="/desafios/meus"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <Trophy className="w-4 h-4" />
              Meus Desafios
            </Link>
            {isAdmin && (
              <Link
                to="/desafios/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Settings2 className="w-4 h-4" />
                Gerenciar
              </Link>
            )}
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
                Nenhum desafio disponível
              </p>
              <p className="text-sm mt-1">
                Não há novos desafios disponíveis no momento. Verifique seus
                desafios ativos!
              </p>
            </div>
            <Link
              to="/desafios/meus"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 mt-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Trophy className="w-4 h-4" />
              Ver Meus Desafios
            </Link>
          </div>
        )}

        {!loading && !error && challenges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={handleJoin}
                isJoining={joiningId === challenge.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// ── ChallengeCard ─────────────────────────────────────────────────────────────

interface ChallengeCardProps {
  challenge: ChallengeDto;
  onJoin: (challenge: ChallengeDto) => void;
  isJoining: boolean;
}

const typeColors: Record<EChallengeType, string> = {
  [EChallengeType.Daily]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [EChallengeType.Weekly]: "bg-primary/10 text-primary border-primary/30",
  [EChallengeType.Monthly]: "bg-accent/10 text-accent border-accent/30",
};

const ChallengeCard = ({ challenge, onJoin, isJoining }: ChallengeCardProps) => {
  const endDate = new Date(challenge.expectedEndDate);
  const formattedDate = endDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_hsl(282_85%_56%/0.2)] transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--gradient-primary)" }}>
          <Trophy className="w-5 h-5 text-primary-foreground" />
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${typeColors[challenge.type]}`}
        >
          {ChallengeTypeLabel[challenge.type]}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {challenge.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
          {challenge.description}
        </p>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span>Até {formattedDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>{challenge.activeParticipantCount} participante{challenge.activeParticipantCount !== 1 ? "s" : ""} ativo{challenge.activeParticipantCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onJoin(challenge)}
        disabled={isJoining}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 mt-auto"
        style={{ background: "var(--gradient-primary)" }}
      >
        {isJoining ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Participando...
          </>
        ) : (
          <>
            Participar
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default ChallengesList;
