import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, User as UserIcon, Hash, AlertCircle, RefreshCw, Pencil } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getProfile, ProfileData } from "@/lib/api";
import { getUser } from "@/lib/auth";

const Profile = () => {
  const authUser = getUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadProfile = async () => {
    if (!authUser?.id) {
      setError("Não foi possível identificar o usuário autenticado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await getProfile(authUser.id);
      setProfile(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullName = profile
    ? `${profile.firstname ?? ""} ${profile.surname ?? ""}`.trim()
    : "";
  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "?";

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />

      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          {!loading && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={loadProfile}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
              <Link
                to="/perfil/editar"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
              >
                <Pencil className="w-4 h-4" />
                Editar perfil
              </Link>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-1">Meu Perfil</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Informações da sua conta
          </p>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Carregando perfil...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Erro ao carregar perfil</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && profile && (
            <div className="space-y-6">
              {/* Avatar + nome */}
              <div className="flex items-center gap-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold truncate">{fullName || "—"}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                  icon={<UserIcon className="w-4 h-4" />}
                  label="Nome"
                  value={profile.firstname || "—"}
                />
                <InfoField
                  icon={<UserIcon className="w-4 h-4" />}
                  label="Sobrenome"
                  value={profile.surname || "—"}
                />
                <InfoField
                  icon={<Mail className="w-4 h-4" />}
                  label="E-mail"
                  value={profile.email || "—"}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}

const InfoField = ({ icon, label, value, className = "", mono = false }: InfoFieldProps) => (
  <div
    className={`rounded-xl border border-border bg-secondary/40 px-4 py-3 ${className}`}
  >
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p
      className={`text-sm text-foreground break-all ${
        mono ? "font-mono text-xs" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

export default Profile;
