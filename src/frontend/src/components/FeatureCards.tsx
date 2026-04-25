import { Utensils, Dumbbell, Users, Trophy, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Dieta",
    description: "Planos alimentares adaptáveis e simples que cabem na sua rotina.",
    sub: "Coma melhor sem dificultar sua vida.",
    icon: Utensils,
    href: "/dieta",
  },
  {
    title: "Planos de Treino",
    description: "Treinos organizados por nível e objetivo.",
    sub: "Evolução com segurança e consistência.",
    icon: Dumbbell,
    href: "/treinos",
  },
  {
    title: "Profissionais",
    description: "Receba orientação personalizada de especialistas.",
    sub: "Decisões baseadas mudam corpos.",
    icon: Users,
    href: "/profissionais",
  },
  {
    title: "Desafios",
    description: "Participe de metas semanais e mensais propostas por especialistas.",
    sub: "Mantenha o foco e acompanhe seu progresso.",
    icon: Trophy,
    href: "/desafios",
  },
];

const FeatureCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {features.map((feature, i) => (
        <a
          key={feature.title}
          href={feature.href}
          className="glass-card rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_hsl(282_85%_56%/0.2)] transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}
        >
          {/* Gradient Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-primary to-accent flex items-center gap-3">
            <feature.icon size={20} className="text-primary-foreground" />
            <h3 className="text-base font-semibold text-primary-foreground">
              {feature.title}
            </h3>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed mb-1">
              {feature.description}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {feature.sub}
            </p>
            <div className="mt-auto flex justify-end">
              <span className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300">
                <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default FeatureCards;
