import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Dumbbell } from "lucide-react";
import { registerUser } from "@/lib/api";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (!firstname.trim()) return "Informe seu primeiro nome.";
    if (!surname.trim()) return "Informe seu sobrenome.";
    if (!email.trim()) return "Informe seu email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Email inválido.";
    if (password.length < 8)
      return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(password))
      return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[a-z]/.test(password))
      return "A senha deve conter pelo menos uma letra minúscula.";
    if (password !== confirmPassword) return "As senhas não coincidem.";
    return null;
  };

  const parseApiErrors = (err: unknown): string => {
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.errors) {
          const msgs = Object.values(parsed.errors).flat();
          return msgs.join(" ");
        }
        return parsed.message || err.message;
      } catch {
        return err.message;
      }
    }
    return "Não foi possível criar a conta. Tente novamente.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        firstname: firstname.trim(),
        surname: surname.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      toast.success("Conta criada com sucesso!");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "flex h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Daily Fitness</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Crie sua conta e comece agora
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstname" className="text-sm font-medium text-foreground">
                  Primeiro Nome
                </label>
                <input
                  id="firstname"
                  type="text"
                  autoComplete="given-name"
                  placeholder="João"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="surname" className="text-sm font-medium text-foreground">
                  Sobrenome
                </label>
                <input
                  id="surname"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Silva"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres (A-z)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="font-medium gradient-text hover:opacity-80 transition-opacity"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
