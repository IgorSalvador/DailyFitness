import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, ChevronRight, Clock, Target, BarChart2 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  DietPlanDto,
  EDietLevel,
  EDietObjective,
  dietLevelLabels,
  dietObjectiveLabels,
  getAvailableDietPlans,
} from "@/lib/diet-plans-api";
import { toast } from "sonner";

const levelColors: Record<EDietLevel, string> = {
  [EDietLevel.Basic]: "bg-emerald-500/10 text-emerald-400",
  [EDietLevel.Intermediate]: "bg-amber-500/10 text-amber-400",
  [EDietLevel.Advanced]: "bg-red-500/10 text-red-400",
};

export default function DietPlansList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DietPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [objective, setObjective] = useState<EDietObjective | "">("");
  const [level, setLevel] = useState<EDietLevel | "">("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAvailableDietPlans(
        objective !== "" ? objective : undefined,
        level !== "" ? level : undefined
      );
      setPlans(res.data ?? []);
    } catch {
      toast.error("Erro ao carregar planos alimentares.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [objective, level]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Planos Alimentares</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Escolha um plano alimentar para iniciar sua jornada
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value === "" ? "" : Number(e.target.value) as EDietObjective)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Todos os objetivos</option>
              {Object.values(EDietObjective).filter(v => typeof v === "number").map((v) => (
                <option key={v} value={v}>{dietObjectiveLabels[v as EDietObjective]}</option>
              ))}
            </select>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value === "" ? "" : Number(e.target.value) as EDietLevel)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Todos os níveis</option>
              {Object.values(EDietLevel).filter(v => typeof v === "number").map((v) => (
                <option key={v} value={v}>{dietLevelLabels[v as EDietLevel]}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Utensils size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum plano alimentar encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => navigate(`/dieta/${plan.id}`)}
                className="glass-card rounded-2xl p-5 text-left hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                    <Utensils size={18} className="text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelColors[plan.level]}`}>
                    {dietLevelLabels[plan.level]}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{plan.description}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target size={12} />
                    {dietObjectiveLabels[plan.objective]}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart2 size={12} />
                    {plan.mealCount} refeições
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {plan.minimumDurationDays}d
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-end text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalhes <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/dieta/meu-plano")}
            className="text-sm text-primary hover:underline"
          >
            Ver meu plano atual →
          </button>
        </div>
      </main>
    </div>
  );
}
