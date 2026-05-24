import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, Clock, TrendingUp } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  UserDietPlanDto,
  EUserDietPlanStatus,
  userDietPlanStatusLabels,
  dietObjectiveLabels,
  dietLevelLabels,
  getDietPlanHistory,
} from "@/lib/diet-plans-api";
import { toast } from "sonner";

const statusStyles: Record<EUserDietPlanStatus, string> = {
  [EUserDietPlanStatus.Active]: "bg-emerald-500/10 text-emerald-400",
  [EUserDietPlanStatus.Cancelled]: "bg-secondary text-muted-foreground",
  [EUserDietPlanStatus.Completed]: "bg-blue-500/10 text-blue-400",
};

const HistoryCard = ({ entry }: { entry: UserDietPlanDto }) => {
  const plan = entry.dietPlan;
  const statusClass = statusStyles[entry.userDietPlanStatus];

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Utensils size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{plan?.name ?? "Plano desconhecido"}</h3>
            {plan && (
              <p className="text-xs text-muted-foreground">
                {dietObjectiveLabels[plan.objective]} · {dietLevelLabels[plan.level]}
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}>
          {userDietPlanStatusLabels[entry.userDietPlanStatus]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <TrendingUp size={13} className="text-muted-foreground" />
        <div className="flex-1 bg-secondary rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${entry.overallProgress}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{entry.overallProgress.toFixed(0)}%</span>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1">
          <Clock size={11} /> Início: {new Date(entry.startedAt).toLocaleDateString("pt-BR")}
        </span>
        {entry.completedAt && (
          <span className="flex items-center gap-1 text-blue-400">
            ✓ Concluído em {new Date(entry.completedAt).toLocaleDateString("pt-BR")}
          </span>
        )}
        {entry.cancelledAt && (
          <span className="flex items-center gap-1 text-muted-foreground">
            ✗ Cancelado em {new Date(entry.cancelledAt).toLocaleDateString("pt-BR")}
          </span>
        )}
        {entry.cancellationReason && (
          <span className="italic">Motivo: {entry.cancellationReason}</span>
        )}
      </div>
    </div>
  );
};

export default function DietPlanHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<UserDietPlanDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDietPlanHistory()
      .then((res) => setHistory(res.data ?? []))
      .catch(() => toast.error("Erro ao carregar histórico."))
      .finally(() => setLoading(false));
  }, []);

  const active = history.filter(h => h.userDietPlanStatus === EUserDietPlanStatus.Active);
  const completed = history.filter(h => h.userDietPlanStatus === EUserDietPlanStatus.Completed);
  const cancelled = history.filter(h => h.userDietPlanStatus === EUserDietPlanStatus.Cancelled);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Histórico de Dietas</h2>
            <p className="text-muted-foreground text-sm mt-1">Todos os planos alimentares que você participou</p>
          </div>
          <button
            onClick={() => navigate("/dieta")}
            className="text-sm text-primary hover:underline"
          >
            Ver planos disponíveis →
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Utensils size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Você ainda não participou de nenhum plano alimentar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-3">Ativo</h3>
                <div className="space-y-3">{active.map(e => <HistoryCard key={e.id} entry={e} />)}</div>
              </section>
            )}
            {completed.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">Concluídos</h3>
                <div className="space-y-3">{completed.map(e => <HistoryCard key={e.id} entry={e} />)}</div>
              </section>
            )}
            {cancelled.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Cancelados</h3>
                <div className="space-y-3">{cancelled.map(e => <HistoryCard key={e.id} entry={e} />)}</div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
