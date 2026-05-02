import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getProfessionals, ProfessionalDto } from "@/lib/professionals-api";
import { getUser } from "@/lib/auth";

const ProfessionalsList = () => {
  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const isGeneral = user?.role === "General";

  const [professionals, setProfessionals] = useState<ProfessionalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProfessionals();
      if (res.success && res.data) {
        setProfessionals(res.data);
      } else {
        setProfessionals([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar profissionais.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Profissionais</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Especialistas disponíveis para orientação personalizada
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
            {isAdmin && (
              <Link
                to="/profissionais/admin/solicitacoes"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <ClipboardList className="w-4 h-4" />
                Solicitações
              </Link>
            )}
            {isGeneral && (
              <Link
                to="/profissionais/solicitar"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <UserCheck className="w-4 h-4" />
                Quero ser Profissional
              </Link>
            )}
          </div>
        </div>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando profissionais...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro ao carregar profissionais</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && professionals.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum profissional encontrado</p>
              <p className="text-sm mt-1">Ainda não há profissionais cadastrados na plataforma.</p>
            </div>
            {isGeneral && (
              <Link
                to="/profissionais/solicitar"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 mt-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <UserCheck className="w-4 h-4" />
                Seja o primeiro! Solicitar acesso
              </Link>
            )}
          </div>
        )}

        {!loading && !error && professionals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

interface ProfessionalCardProps {
  professional: ProfessionalDto;
}

const ProfessionalCard = ({ professional }: ProfessionalCardProps) => {
  const fullName = `${professional.firstname} ${professional.surname}`.trim();
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <Link
      to={`/profissionais/${professional.id}`}
      className="glass-card rounded-xl p-5 flex flex-col gap-4 group hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_hsl(282_85%_56%/0.2)] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{fullName || "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{professional.email}</p>
        </div>
      </div>

      {professional.specialization && (
        <div className="rounded-lg bg-secondary/60 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">Especialização</p>
          <p className="text-sm text-foreground line-clamp-2">{professional.specialization}</p>
        </div>
      )}

      {professional.skills && professional.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {professional.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
            >
              {skill.trim()}
            </span>
          ))}
          {professional.skills.length > 4 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
              +{professional.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-end">
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default ProfessionalsList;
