import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  ChevronRight,
  TrendingUp,
  Plus,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  getMyChallenges,
  UserChallengeDto,
  EChallengeType,
  EUserChallengeStatus,
  ChallengeTypeLabel,
  UserChallengeStatusLabel,
} from "@/lib/challenges-api";

const MyChallenges = () => {
  const [participations, setParticipations] = useState<UserChallengeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyChallenges();
      if (res.success && res.data) {
        setParticipations(res.data);
      } else {
        setParticipations([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar seus desafios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const active = participations.filter(
    (p) => p.userChallengeStatus === EUserChallengeStatus.Active
  );
  const others = participations.filter(
    (p) => p.userChallengeStatus !== EUserChallengeStatus.Active
  );

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Meus Desafios</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Suas participações em desafios de fitness
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
              to="/desafios"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Explorar Desafios
            </Link>
          </div>
        </div>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando seus desafios...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro ao carregar seus desafios</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && participations.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Você ainda não participa de nenhum desafio
              </p>
              <p className="text-sm mt-1">
                Explore os desafios disponíveis e comece a sua jornada!
              </p>
            </div>
            <Link
              to="/desafios"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 mt-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Trophy className="w-4 h-4" />
              Explorar Desafios
            </Link>
          </div>
        )}

        {!loading && !error && participations.length > 0 && (
          <div className="space-y-8">
            {active.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Ativos ({active.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {active.map((p) => (
                    <ParticipationCard key={p.id} participation={p} />
                  ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-base font-semibold text-muted-foreground">
                  Histórico ({others.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {others.map((p) => (
                    <ParticipationCard key={p.id} participation={p} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ── ParticipationCard ─────────────────────────────────────────────────────────

interface ParticipationCardProps {
  participation: UserChallengeDto;
}

const typeColors: Record<EChallengeType, string> = {
  [EChallengeType.Daily]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [EChallengeType.Weekly]: "bg-primary/10 text-primary border-primary/30",
  [EChallengeType.Monthly]: "bg-accent/10 text-accent border-accent/30",
};

const statusStyles: Record<EUserChallengeStatus, string> = {
  [EUserChallengeStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EUserChallengeStatus.Completed]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [EUserChallengeStatus.Abandoned]: "bg-secondary text-muted-foreground border-border",
  [EUserChallengeStatus.Discontinued]: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  [EUserChallengeStatus.Expired]: "bg-destructive/10 text-destructive border-destructive/30",
};

const ParticipationCard = ({ participation: p }: ParticipationCardProps) => {
  const joinedDate = new Date(p.joinedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isActive = p.userChallengeStatus === EUserChallengeStatus.Active;

  return (
    <Link
      to={`/desafios/meus/${p.id}`}
      className="glass-card rounded-xl p-5 flex flex-col gap-4 group hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_hsl(282_85%_56%/0.2)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${typeColors[p.challengeType]}`}
        >
          {ChallengeTypeLabel[p.challengeType]}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${statusStyles[p.userChallengeStatus]}`}
        >
          {UserChallengeStatusLabel[p.userChallengeStatus]}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {p.challengeName}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span>Entrou em {joinedDate}</span>
        </div>
      </div>

      {isActive && (
        <div className="rounded-lg bg-secondary/60 px-3 py-2.5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Progresso acumulado</p>
            <p className="text-sm font-semibold text-foreground">
              {p.currentProgress.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-end">
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default MyChallenges;
