import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Utensils,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Settings2,
  Filter,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import { getUser } from "@/lib/auth";
import {
  DietPlanDto,
  UserDietPlanDto,
  EUserDietPlanStatus,
  EDietObjective,
  EDietLevel,
  dietObjectiveLabels,
  dietLevelLabels,
  getAvailableDietPlans,
  getCurrentDietPlan,
  subscribeDietPlan,
} from "@/lib/diet-plans-api";

const levelColors: Record<EDietLevel, string> = {
  [EDietLevel.Basic]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [EDietLevel.Intermediate]: "bg-primary/10 text-primary border-primary/30",
  [EDietLevel.Advanced]: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function DietPlansList() {
  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const isProfessional = user?.role === "Professional";
  const navigate = useNavigate();

  const [plans, setPlans] = useState<DietPlanDto[]>([]);
  const [activePlan, setActivePlan] = useState<UserDietPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [objective, setObjective] = useState<EDietObjective | "">("");
  const [level, setLevel] = useState<EDietLevel | "">("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [plansRes, currentRes] = await Promise.allSettled([
        getAvailableDietPlans(
          objective !== "" ? (objective as EDietObjective) : undefined,
          level !== "" ? (level as EDietLevel) : undefined
        ),
        getCurrentDietPlan(),
      ]);

      if (plansRes.status === "fulfilled") {
        setPlans(plansRes.value.data ?? []);
      } else {
        setError(plansRes.reason instanceof Error ? plansRes.reason.message : "Erro ao carregar planos.");
      }

      if (
        currentRes.status === "fulfilled" &&
        currentRes.value.data &&
        currentRes.value.data.userDietPlanStatus === EUserDietPlanStatus.Active
      ) {
        setActivePlan(currentRes.value.data);
      } else {
        setActivePlan(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [objective, level]);

  const handleSubscribe = async (plan: DietPlanDto) => {
    if (activePlan) {
      toast.error("Você já possui um plano ativo.", {
        description: "Cancele o plano atual antes de se inscrever em outro.",
      });
      return;
    }
    setSubscribingId(plan.id);
    try {
      await subscribeDietPlan(plan.id);
      toast.success("Inscrição realizada!", {
        description: `Você se inscreveu no plano "${plan.name}".`,
      });
      navigate("/dieta/meu-plano");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao se inscrever.");
      setSubscribingId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Planos Alimentares</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Encontre o plano ideal para o seu objetivo
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
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
            {(isAdmin || isProfessional) && (
              <Link
                to={isAdmin ? "/dieta/gestao" : "/dieta/profissional"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Settings2 className="w-4 h-4" />
                Gerenciar
              </Link>
            )}
          </div>
        </div>

        {/* Banner: plano ativo */}
        {activePlan && (
          <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>
                Você está inscrito em <strong>{activePlan.dietPlan?.name ?? "um plano"}</strong>.
              </span>
            </div>
            <Link
              to="/dieta/meu-plano"
              className="text-xs font-medium text-emerald-400 underline whitespace-nowrap hover:text-emerald-300"
            >
              Acompanhar progresso
            </Link>
          </div>
        )}

        {/* Filtros */}
        <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-4 items-center">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-3 flex-1">
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value === "" ? "" : Number(e.target.value) as EDietObjective)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="">Todos os objetivos</option>
              {Object.entries(dietObjectiveLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value === "" ? "" : Number(e.target.value) as EDietLevel)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="">Todos os níveis</option>
              {Object.entries(dietLevelLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando planos alimentares...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro ao carregar planos</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && plans.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Utensils className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum plano disponível</p>
              <p className="text-sm mt-1">Não há planos alimentares ativos com os filtros selecionados.</p>
            </div>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                activePlan={activePlan}
                onSubscribe={handleSubscribe}
                isSubscribing={subscribingId === plan.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ── PlanCard ──────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: DietPlanDto;
  activePlan: UserDietPlanDto | null;
  onSubscribe: (plan: DietPlanDto) => void;
  isSubscribing: boolean;
}

const PlanCard = ({ plan, activePlan, onSubscribe, isSubscribing }: PlanCardProps) => {
  const navigate = useNavigate();

  const isThisPlanActive =
    activePlan !== null &&
    activePlan.userDietPlanStatus === EUserDietPlanStatus.Active &&
    activePlan.dietPlanId === plan.id;

  const hasDifferentActivePlan =
    activePlan !== null &&
    activePlan.userDietPlanStatus === EUserDietPlanStatus.Active &&
    activePlan.dietPlanId !== plan.id;

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_hsl(282_85%_56%/0.2)] transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Utensils className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${levelColors[plan.level]}`}>
          {dietLevelLabels[plan.level]}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-snug">{plan.name}</h3>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
          {plan.description}
        </p>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>🎯 {dietObjectiveLabels[plan.objective]}</p>
        <p>⏱ Duração mínima: {plan.minimumDurationDays} dias</p>
        <p>🍽️ {plan.mealCount} refeição(ões)</p>
      </div>

      {/* Badge: plano ativo */}
      {isThisPlanActive && (
        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-center">
          ✓ Você está inscrito neste plano
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <Link
          to={`/dieta/${plan.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
        >
          Detalhes <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {isThisPlanActive ? (
          <button
            type="button"
            onClick={() => navigate("/dieta/meu-plano")}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <TrendingUp className="w-3 h-3" /> Acompanhar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubscribe(plan)}
            disabled={isSubscribing || hasDifferentActivePlan}
            title={hasDifferentActivePlan ? "Cancele seu plano atual antes de se inscrever" : undefined}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSubscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Inscrever-se"}
          </button>
        )}
      </div>
    </div>
  );
};
