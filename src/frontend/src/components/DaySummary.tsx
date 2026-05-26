import { useEffect, useState, ElementType } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Utensils, ArrowRight, Plus } from "lucide-react";
import {
  getCurrentTrainingPlan,
  UserTrainingPlanDto,
  EUserTrainingPlanStatus,
} from "@/lib/training-plans-api";
import {
  getCurrentDietPlanProgress,
  UserDietPlanDto,
  EUserDietPlanStatus,
} from "@/lib/diet-plans-api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = new Date().toISOString().split("T")[0];

function calcTrainingSummary(utp: UserTrainingPlanDto) {
  const todayLogs = utp.dailyLogs.filter((l) =>
    l.progressDate.startsWith(todayStr)
  );

  const completedToday = utp.progresses.filter((p) =>
    p.progressDate.startsWith(todayStr)
  ).length;

  const totalActive =
    utp.trainingPlan?.workouts
      .flatMap((w) => w.items)
      .filter((i) => i.status === 1).length ?? 0;

  const avgPct =
    todayLogs.length > 0
      ? Math.round(
          todayLogs.reduce((s, l) => s + l.progressPercentage, 0) /
            todayLogs.length
        )
      : 0;

  const allFinished =
    todayLogs.length > 0 && todayLogs.every((l) => l.isFinished);

  return { completedToday, totalActive, avgPct, allFinished, todayLogs };
}

function calcDietSummary(udp: UserDietPlanDto) {
  const todayLogs = udp.dailyLogs.filter((l) =>
    l.logDate.startsWith(todayStr)
  );

  const totalMeals = udp.dietPlan?.meals.length ?? 0;

  const avgPct =
    todayLogs.length > 0
      ? Math.round(
          todayLogs.reduce((s, l) => s + l.completionPercentage, 0) /
            todayLogs.length
        )
      : 0;

  const completedMeals = todayLogs.filter(
    (l) => l.completionPercentage === 100
  ).length;

  return { todayLogs, totalMeals, avgPct, completedMeals };
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CardSkeletonProps {
  icon: ElementType;
}

function CardSkeleton({ icon: Icon }: CardSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-secondary/50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Icon size={18} className="text-muted-foreground/40" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full" />
    </div>
  );
}

interface NoPlanCardProps {
  icon: ElementType;
  label: string;
  explorePath: string;
  exploreLabel: string;
  gradient: string;
}

function NoPlanCard({
  icon: Icon,
  label,
  explorePath,
  exploreLabel,
  gradient,
}: NoPlanCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} opacity-30 flex items-center justify-center`}
        >
          <Icon size={18} className="text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-muted-foreground">
            Sem plano ativo
          </p>
        </div>
      </div>
      <Link
        to={explorePath}
        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
      >
        <Plus size={12} />
        {exploreLabel}
      </Link>
    </div>
  );
}

interface ProgressCardProps {
  icon: ElementType;
  label: string;
  value: string;
  subValue?: string;
  pct: number;
  gradient: string;
  iconGradient: string;
  detailPath: string;
  finished?: boolean;
}

function ProgressCard({
  icon: Icon,
  label,
  value,
  subValue,
  pct,
  gradient,
  iconGradient,
  detailPath,
  finished,
}: ProgressCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors duration-300">
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center`}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className="text-sm font-semibold leading-tight">{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
          )}
        </div>
        {finished && (
          <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/20">
            Concluído
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{pct}% completo</span>
        <Link
          to={detailPath}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          Ver plano
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const DaySummary = () => {
  const [utp, setUtp] = useState<UserTrainingPlanDto | null | "loading">(
    "loading"
  );
  const [udp, setUdp] = useState<UserDietPlanDto | null | "loading">(
    "loading"
  );

  useEffect(() => {
    getCurrentTrainingPlan()
      .then((res) => {
        const plan = res.data ?? null;
        setUtp(
          plan?.userTrainingPlanStatus === EUserTrainingPlanStatus.Active
            ? plan
            : null
        );
      })
      .catch(() => setUtp(null));

    getCurrentDietPlanProgress()
      .then((res) => {
        const plan = res.data ?? null;
        setUdp(
          plan?.userDietPlanStatus === EUserDietPlanStatus.Active ? plan : null
        );
      })
      .catch(() => setUdp(null));
  }, []);

  const trainingSummary =
    utp && utp !== "loading" ? calcTrainingSummary(utp) : null;
  const dietSummary =
    udp && udp !== "loading" ? calcDietSummary(udp) : null;

  const hasAnyPlan =
    (utp !== "loading" && utp !== null) ||
    (udp !== "loading" && udp !== null);

  return (
    <div
      className="glass-card rounded-xl p-6 animate-slide-up"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Resumo do Dia</h2>
        {hasAnyPlan && (
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── TREINO ── */}
        {utp === "loading" ? (
          <CardSkeleton icon={Dumbbell} />
        ) : utp === null ? (
          <NoPlanCard
            icon={Dumbbell}
            label="Treino do Dia"
            explorePath="/treinos"
            exploreLabel="Explorar planos de treino"
            gradient="from-violet-500 to-purple-600"
          />
        ) : (
          <ProgressCard
            icon={Dumbbell}
            label="Treino do Dia"
            value={
              trainingSummary!.totalActive > 0
                ? `${trainingSummary!.completedToday}/${trainingSummary!.totalActive} exercícios`
                : "Nenhum exercício hoje"
            }
            subValue={utp.trainingPlan?.name}
            pct={trainingSummary!.avgPct}
            gradient="from-violet-500 to-purple-600"
            iconGradient="from-violet-500 to-purple-600"
            detailPath="/treinos/meu-plano"
            finished={trainingSummary!.allFinished}
          />
        )}

        {/* ── DIETA ── */}
        {udp === "loading" ? (
          <CardSkeleton icon={Utensils} />
        ) : udp === null ? (
          <NoPlanCard
            icon={Utensils}
            label="Dieta do Dia"
            explorePath="/dieta"
            exploreLabel="Explorar planos alimentares"
            gradient="from-emerald-500 to-green-600"
          />
        ) : (
          <ProgressCard
            icon={Utensils}
            label="Dieta do Dia"
            value={
              dietSummary!.totalMeals > 0
                ? `${dietSummary!.completedMeals}/${dietSummary!.totalMeals} refeições concluídas`
                : "Nenhuma refeição hoje"
            }
            subValue={udp.dietPlan?.name}
            pct={dietSummary!.avgPct}
            gradient="from-emerald-500 to-green-600"
            iconGradient="from-emerald-500 to-green-600"
            detailPath="/dieta/meu-plano"
            finished={
              dietSummary!.totalMeals > 0 &&
              dietSummary!.completedMeals === dietSummary!.totalMeals
            }
          />
        )}
      </div>
    </div>
  );
};

export default DaySummary;
