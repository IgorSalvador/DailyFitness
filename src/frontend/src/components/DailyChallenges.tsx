import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, AlertCircle, CalendarDays, ChevronRight, Flame, Trophy,
} from "lucide-react";
import {
  getMyChallenges,
  EChallengeType,
  EUserChallengeStatus,
  UserChallengeDto,
} from "@/lib/challenges-api";

const DailyChallenges = () => {
  const [challenges, setChallenges] = useState<UserChallengeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyChallenges();
        if (res.success && res.data) {
          const daily = res.data.filter(
            (c) =>
              c.challengeType === EChallengeType.Daily &&
              c.userChallengeStatus === EUserChallengeStatus.Active
          );
          setChallenges(daily);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar desafios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div
      className="glass-card rounded-xl p-6 animate-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold gradient-text">Desafios Diários</h2>
        <Link
          to="/desafios/meus"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Ver todos
        </Link>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-xs">Carregando desafios...</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && challenges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <CalendarDays className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Nenhum desafio diário ativo
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você ainda não participa de nenhum desafio diário. Que tal explorar os desafios disponíveis?
            </p>
          </div>
          <Link
            to="/desafios"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Flame className="w-3.5 h-3.5" />
            Explorar desafios
          </Link>
        </div>
      )}

      {/* ── List ── */}
      {!loading && !error && challenges.length > 0 && (
        <ul className="space-y-3">
          {challenges.map((uc) => (
            <ChallengeRow key={uc.id} userChallenge={uc} />
          ))}
        </ul>
      )}
    </div>
  );
};

interface ChallengeRowProps {
  userChallenge: UserChallengeDto;
}

const ChallengeRow = ({ userChallenge: uc }: ChallengeRowProps) => {
  const target = uc.targetProgress > 0 ? uc.targetProgress : 1;
  const current = Math.min(uc.currentProgress, target);
  const percent = Math.round((current / target) * 100);
  const isComplete = percent >= 100;

  return (
    <li>
      <Link
        to={`/desafios/meus/${uc.id}`}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
          ${isComplete
            ? "bg-primary/10 hover:bg-primary/15"
            : "bg-secondary/50 hover:bg-secondary"
          }`}
      >
        {/* Ícone de status */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
            ${isComplete
              ? "bg-gradient-to-br from-primary to-accent shadow-sm shadow-primary/30"
              : "bg-muted group-hover:bg-muted-foreground/20"
            }`}
        >
          {isComplete
            ? <Trophy className="w-4 h-4 text-primary-foreground" />
            : <Flame className="w-4 h-4 text-muted-foreground" />
          }
        </div>

        {/* Nome + barra de progresso */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate transition-colors ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
            {uc.challengeName}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              {current}/{target}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </Link>
    </li>
  );
};

export default DailyChallenges;
