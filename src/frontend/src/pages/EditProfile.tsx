import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getProfile, updateProfile } from "@/lib/api";
import { getToken, getUser, saveAuth } from "@/lib/auth";

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

    const fn = firstname.trim();
    const sn = surname.trim();
    const em = email.trim();

    if (!fn || !sn || !em) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Email inválido.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile(authUser.id, {
        firstname: fn,
        surname: sn,
        email: em,
      });

      // Atualiza dados em cache (mantém o token atual)
      const token = getToken();
      if (token) {
        saveAuth(token, {
          ...authUser,
          name: `${fn} ${sn}`.trim(),
          email: em,
        });
      }

      setSuccess(res.message || "Perfil atualizado com sucesso.");
      setTimeout(() => navigate("/perfil"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
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
            Atualize suas informações pessoais
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Carregando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Nome"
                  value={firstname}
                  onChange={setFirstname}
                  placeholder="Seu nome"
                  disabled={saving}
                />
                <Field
                  label="Sobrenome"
                  value={surname}
                  onChange={setSurname}
                  placeholder="Seu sobrenome"
                  disabled={saving}
                />
              </div>
              <Field
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="voce@email.com"
                disabled={saving}
              />

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
                  {saving ? "Salvando..." : "Salvar alterações"}
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

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

const Field = ({ label, value, onChange, placeholder, type = "text", disabled }: FieldProps) => (
  <label className="block">
    <span className="block text-xs text-muted-foreground mb-1.5">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
    />
  </label>
);

export default EditProfile;