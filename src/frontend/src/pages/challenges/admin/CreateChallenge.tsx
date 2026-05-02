import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import {
  createChallenge,
  EChallengeType,
  ChallengeTypeLabel,
} from "@/lib/challenges-api";

const CreateChallenge = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EChallengeType | "">("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("O nome é obrigatório.");
    else if (name.trim().length < 5) errs.push("O nome deve ter no mínimo 5 caracteres.");
    else if (name.trim().length > 100) errs.push("O nome deve ter no máximo 100 caracteres.");

    if (!description.trim()) errs.push("A descrição é obrigatória.");
    else if (description.trim().length < 50) errs.push("A descrição deve ter no mínimo 50 caracteres.");
    else if (description.trim().length > 4000) errs.push("A descrição deve ter no máximo 4000 caracteres.");

    if (type === "") errs.push("O tipo do desafio é obrigatório.");

    if (!expectedEndDate) errs.push("A data limite é obrigatória.");
    else if (new Date(expectedEndDate) <= new Date()) errs.push("A data limite deve ser uma data futura.");

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors([]);
    setLoading(true);
    try {
      const res = await createChallenge({
        name: name.trim(),
        description: description.trim(),
        type: type as EChallengeType,
        expectedEndDate: new Date(expectedEndDate).toISOString(),
      });

      if (!res.success) {
        setErrors(
          (res as unknown as { errors?: string[] }).errors?.length
            ? (res as unknown as { errors: string[] }).errors
            : [res.message || "Falha ao criar desafio."]
        );
        return;
      }

      toast.success("Desafio criado com sucesso!", {
        description: `"${name.trim()}" já está disponível para os usuários.`,
      });
      navigate("/desafios/admin");
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : "Erro inesperado ao criar desafio.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Data mínima: amanhã
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Link
          to="/desafios/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Gerenciar Desafios
        </Link>

        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Criar Desafio</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha os dados para criar um novo desafio na plataforma.
            </p>
          </div>

          <div className="h-px bg-border" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                Nome <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Desafio 30 dias de corrida"
                maxLength={100}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Mínimo 5 caracteres</span>
                <span className="text-xs text-muted-foreground">{name.length}/100</span>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                Tipo <span className="text-destructive">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value === "" ? "" : (Number(e.target.value) as EChallengeType))}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
              >
                <option value="" disabled>
                  Selecione o tipo do desafio
                </option>
                {(Object.values(EChallengeType).filter((v) => typeof v === "number") as EChallengeType[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {ChallengeTypeLabel[t]}
                    </option>
                  )
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Define a periodicidade dos registros de progresso (diário, semanal ou mensal).
                Não poderá ser alterado após usuários ingressarem.
              </p>
            </div>

            {/* Data Limite */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                Data Limite <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                min={minDateStr}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                Descrição <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o desafio em detalhes: objetivos, regras, como registrar o progresso..."
                rows={6}
                maxLength={4000}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60 resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Mínimo 50 caracteres</span>
                <span className="text-xs text-muted-foreground">{description.length}/4000</span>
              </div>
            </div>

            {/* Erros */}
            {errors.length > 0 && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 space-y-1">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Corrija os erros abaixo:</span>
                </div>
                {errors.map((err, i) => (
                  <p key={i} className="text-sm text-destructive pl-6">
                    • {err}
                  </p>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Desafio"
                )}
              </button>
              <Link
                to="/desafios/admin"
                className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateChallenge;
