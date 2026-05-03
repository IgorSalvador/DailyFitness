import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, AlertCircle, CheckCircle2, User as UserIcon, Mail, Lock } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getProfile, updateProfile } from "@/lib/api";
import { clearAuth, getUser } from "@/lib/auth";

const EditProfile = () => {
  const navigate = useNavigate();
  const authUser = getUser();

  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!authUser?.id) {
        setError("Não foi possível identificar o usuário autenticado.");
        setLoading(false);
        return;
      }
      try {
        const res = await getProfile(authUser.id);
        if (res.data) {
          setFirstname(res.data.firstname ?? "");
          setSurname(res.data.surname ?? "");
          setEmail(res.data.email ?? "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !authUser?.id) return;
    setError("");
    setSuccess("");

    const em = email.trim();

    if (!em) {
      setError("O e-mail é obrigatório.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("E-mail inválido.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(authUser.id, { email: em });

      setSuccess("E-mail atualizado com sucesso! Você será redirecionado para o login.");

      setTimeout(() => {
        clearAuth();
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />

      <main className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao perfil
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-1">Editar Perfil</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Atualize seu endereço de e-mail
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Carregando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Campos somente leitura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyField
                  label="Nome"
                  value={firstname || "—"}
                  icon={<UserIcon className="w-4 h-4" />}
                />
                <ReadOnlyField
                  label="Sobrenome"
                  value={surname || "—"}
                  icon={<UserIcon className="w-4 h-4" />}
                />
              </div>

              <div className="h-px bg-border" />

              {/* Campo editável */}
              <div>
                <label className="block">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Novo e-mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    disabled={saving}
                    autoComplete="email"
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Ao alterar o e-mail, sua sessão será encerrada e você precisará fazer login novamente com o novo endereço.
                </span>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Salvando..." : "Salvar e-mail"}
                </button>
                <Link
                  to="/perfil"
                  className="px-5 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const ReadOnlyField = ({ label, value, icon }: ReadOnlyFieldProps) => (
  <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3 opacity-70">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

export default EditProfile;
