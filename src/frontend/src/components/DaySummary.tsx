import { Droplets, Flame, Activity } from "lucide-react";

const stats = [
  {
    icon: Activity,
    label: "Atividades",
    value: "4/6",
    percent: 67,
    color: "from-primary to-accent",
  },
  {
    icon: Droplets,
    label: "Água",
    value: "1.5L / 2L",
    percent: 75,
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Flame,
    label: "Treino",
    value: "Concluído",
    percent: 100,
    color: "from-accent to-yellow-400",
  },
];

const DaySummary = () => {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-lg font-semibold mb-5">Resumo do Dia</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors duration-300"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <stat.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-semibold">{stat.value}</p>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${stat.color} animate-progress-fill`}
                  style={{ "--progress-width": `${stat.percent}%`, width: `${stat.percent}%` } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaySummary;
