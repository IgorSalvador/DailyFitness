import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  Loader2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  ChevronRight,
  Plus,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  UserDietPlanDto,
  EUserDietPlanStatus,
  userDietPlanStatusLabels,
  dietObjectiveLabels,
  dietLevelLabels,
  getDietPlanHistory,
} from "@/lib/diet-plans-api";

const statusStyles: Record<EUserDietPlanStatus, string> = {
  [EUserDietPlanStatus.Active]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EUserDietPlanStatus.Cancelled]: "bg-secondary text-muted-foreground border-border",
  [EUserDietPlanStatus.Completed]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export default function DietPlanHistory() {
  const [history, setHistory] = useState<UserDietPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDietPlanHistory();
      setHistory(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const active = history.filter((h) => h.userDietPlanStatus === EUserDietPlanStatus.Active);
  const past = history.filter((h) => h.userDietPlanStatus !== EUserDietPlanStatus.Active);

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Histórico de Dietas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os seus planos alimentares
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            <Link
              to="/dieta/meu-plano"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <Utensils className="w-4 h-4" />
              Meu Plano
            </Link>
            <Link
              to="/dieta"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Explorar Planos
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando histórico...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro ao carregar histórico</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && history.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Utensils className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum plano alimentar encontrado</p>
              <p className="text-sm mt-1">Explore os planos disponíveis e comece sua jornada!</p>
            </div>
            <Link
              to="/dieta"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 mt-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              Explorar Planos
            </Link>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && history.length > 0 && (
          <div className="space-y-8">
            {active.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Ativo ({active.length})
                </h3>
                <div className="space-y-3">
                  {active.map((entry) => (
                    <HistoryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-base font-semibold text-muted-foreground">
                  Histórico ({past.length})
                </h3>
                <div className="space-y-3">
                  {past.map((entry) => (
                    <HistoryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ── HistoryCard ───────────────────────────────────────────────────────────────

interface HistoryCardProps {
  entry: UserDietPlanDto;
}

const HistoryCard = ({ entry }: HistoryCardProps) => {
  const plan = entry.dietPlan;
  const isActive = entry.userDietPlanStatus === EUserDietPlanStatus.Active;

  const startedDate = new Date(entry.startedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const endedDate = entry.completedAt
    ? new Date(entry.completedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : entry.cancelledAt
    ? new Date(entry.cancelledAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Utensils className="w-5 h-5 text-primary-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="font-semibold text-sm text-foreground">
            {plan?.name ?? "Plano desconhecido"}
          </p>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusStyles[entry.userDietPlanStatus]}`}
          >
            {userDietPlanStatusLabels[entry.userDietPlanStatus]}
          </span>
        </div>

        {plan && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {dietObjectiveLabels[plan.objective]} · {dietLevelLabels[plan.level]}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>Início: {startedDate}</span>
          </div>
          {endedDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>
                {entry.userDietPlanStatus === EUserDietPlanStatus.Completed
                  ? "Concluído"
                  : "Cancelado"}
                : {endedDate}
              </span>
            </div>
          )}
        </div>

        {entry.cancellationReason && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            Motivo: {entry.cancellationReason}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progresso</span>
          </div>
          <p className="text-lg font-bold text-primary">
            {entry.overallProgress.toFixed(1)}%
          </p>
        </div>

        {isActive && (
          <Link
            to="/dieta/meu-plano"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Ver <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
