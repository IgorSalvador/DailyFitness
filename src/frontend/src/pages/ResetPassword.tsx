import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Dumbbell,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { resetPassword } from "@/lib/api";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ token?: string }>();

  // Captura token de query (?token=...) ou route param (/reset-password/:token)
  const token = useMemo(
    () => (searchParams.get("token") || params.token || "").trim(),
    [searchParams, params.token]
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  // Redireciona automaticamente após sucesso
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/login", { replace: true }), 4000);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const validate = (): FieldErrors | null => {
    const errs: FieldErrors = {};
    if (!password) errs.password = "Informe a nova senha.";
    else if (password.length < 8)
      errs.password = "A senha deve ter pelo menos 8 caracteres.";
    else if (!/[A-Z]/.test(password))
      errs.password = "A senha deve conter pelo menos uma letra maiúscula.";
    else if (!/[a-z]/.test(password))
      errs.password = "A senha deve conter pelo menos uma letra minúscula.";

    if (!confirmPassword)
      errs.confirmPassword = "Confirme a nova senha.";
    else if (password !== confirmPassword)
      errs.confirmPassword = "As senhas não coincidem.";

    return Object.keys(errs).length ? errs : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    if (!token) {
      setError(
        "Token de recuperação não encontrado. Solicite um novo link de redefinição."
      );
      return;
    }

    const errs = validate();
    if (errs) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir a senha. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Daily Fitness</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Defina sua nova senha
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {success ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Senha redefinida!
              </h2>
              <p className="text-sm text-muted-foreground">
                Sua senha foi atualizada com sucesso. Você será redirecionado
                para o login em instantes.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Redefinir senha
                </h2>
                <p className="text-sm text-muted-foreground">
                  Crie uma nova senha forte para sua conta.
                </p>
              </div>

              {!token && (
                <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-foreground" />
                  <span>
                    Token de recuperação ausente. Acesse este link a partir do
                    email recebido.
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive animate-fade-in">
                  {error}
                </div>
              )}

              {/* Nova senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password)
                        setFieldErrors((p) => ({ ...p, password: undefined }));
                      if (error) setError("");
                    }}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.password}
                    className={`flex h-12 w-full rounded-xl border bg-secondary/50 px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 ${
                      fieldErrors.password
                        ? "border-destructive/60"
                        : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword)
                        setFieldErrors((p) => ({
                          ...p,
                          confirmPassword: undefined,
                        }));
                      if (error) setError("");
                    }}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.confirmPassword}
                    className={`flex h-12 w-full rounded-xl border bg-secondary/50 px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 ${
                      fieldErrors.confirmPassword
                        ? "border-destructive/60"
                        : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full h-12 rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir senha"
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
