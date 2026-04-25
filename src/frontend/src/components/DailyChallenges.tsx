import { useState } from "react";
import { Dumbbell, Zap, Droplets, Footprints, Target, RotateCcw, Check } from "lucide-react";

interface Challenge {
  id: string;
  label: string;
  icon: React.ElementType;
  defaultChecked: boolean;
}

const challenges: Challenge[] = [
  { id: "flexao", label: "5x10 Flexões", icon: Dumbbell, defaultChecked: true },
  { id: "polichinelo", label: "3x10 Polichinelo", icon: Zap, defaultChecked: true },
  { id: "corda", label: "1min Salto à Corda", icon: RotateCcw, defaultChecked: true },
  { id: "agua", label: "Beber 2L de água", icon: Droplets, defaultChecked: false },
  { id: "caminhada", label: "20min de Caminhada", icon: Footprints, defaultChecked: false },
  { id: "abdominal", label: "3x10 Abdominais", icon: Target, defaultChecked: false },
];

const DailyChallenges = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(challenges.map((c) => [c.id, c.defaultChecked]))
  );

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const percent = Math.round((completedCount / challenges.length) * 100);

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold gradient-text">Desafios Diários</h2>
        <span className="text-sm font-semibold text-muted-foreground">
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-3">
        {challenges.map((challenge) => {
          const isChecked = checked[challenge.id];
          return (
            <li key={challenge.id}>
              <button
                onClick={() => toggle(challenge.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 cursor-pointer group
                  ${isChecked
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "bg-secondary/50 hover:bg-secondary"
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${isChecked
                      ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                      : "bg-muted group-hover:bg-muted-foreground/20"
                    }`}
                >
                  {isChecked && <Check size={14} className="text-primary-foreground animate-check-bounce" />}
                </div>
                <challenge.icon
                  size={18}
                  className={`flex-shrink-0 transition-colors duration-300 ${
                    isChecked ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-all duration-300 ${
                    isChecked ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {challenge.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DailyChallenges;
