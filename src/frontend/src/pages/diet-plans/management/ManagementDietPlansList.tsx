import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Utensils, Users, ToggleLeft, ToggleRight } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  DietPlanDto,
  dietObjectiveLabels,
  dietLevelLabels,
  adminGetAllDietPlans,
  profGetManagedDietPlans,
} from "@/lib/diet-plans-api";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

export default function ManagementDietPlansList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DietPlanDto[]>([]);
  const [loading, setLoading] = useState(true);

  const role = getUser()?.role;
  const isAdmin = role === "Administrator";
  const basePath = isAdmin ? "/dieta/gestao" : "/dieta/profissional";

  useEffect(() => {
    const fetchFn = isAdmin ? adminGetAllDietPlans : profGetManagedDietPlans;
    fetchFn()
      .then((res) => setPlans(res.data ?? []))
      .catch(() => toast.error("Erro ao carregar planos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">
              {isAdmin ? "Gestão de Planos Alimentares" : "Meus Planos Alimentares"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdmin ? "Todos os planos do sistema" : "Planos que você criou"}
            </p>
          </div>
          <button
            onClick={() => navigate(`${basePath}/criar`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus size={16} /> Novo plano
          </button>
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
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Plano</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Objetivo</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Nível</th>
                  <th className="px-5 py-3 text-center hidden lg:table-cell">Status</th>
                  <th className="px-5 py-3 text-center hidden lg:table-cell">Assinantes</th>
                  <th className="px-5 py-3 text-center">Refeições</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    onClick={() => navigate(`${basePath}/${plan.id}`)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{plan.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground">
                      {dietObjectiveLabels[plan.objective]}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                        {dietLevelLabels[plan.level]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-center">
                      {plan.status === "Active" ? (
                        <span className="flex items-center justify-center gap-1 text-emerald-400 text-xs">
                          <ToggleRight size={14} /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                          <ToggleLeft size={14} /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-center">
                      <span className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                        <Users size={12} />
                        {plan.activeSubscriberCount}/{plan.subscriberCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-muted-foreground text-xs">
                      {plan.mealCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
