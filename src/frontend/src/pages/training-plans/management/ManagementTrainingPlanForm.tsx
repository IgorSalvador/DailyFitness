import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/DashboardHeader";
import { getUser } from "@/lib/auth";
import {
  adminGetTrainingPlan,
  adminCreateTrainingPlan,
  adminUpdateTrainingPlan,
  profGetManagedPlan,
  profCreateManagedPlan,
  profUpdateManagedPlan,
  ETrainingObjective,
  ETrainingLevel,
  TrainingObjectiveLabel,
  TrainingLevelLabel,
  TrainingPlanDto,
} from "@/lib/training-plans-api";

// ── Form types ─────────────────────────────────────────────────────────────────

interface ItemForm {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  sets: string;
  repetitions: string;
  order: number;
}

interface WorkoutForm {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  order: number;
  items: ItemForm[];
  collapsed: boolean;
}

const emptyItem = (order: number): ItemForm => ({
  name: "",
  description: "",
  instructions: "",
  sets: "",
  repetitions: "",
  order,
});

const emptyWorkout = (order: number): WorkoutForm => ({
  name: "",
  description: "",
  instructions: "",
  order,
  items: [emptyItem(1)],
  collapsed: false,
});

// ── Component ──────────────────────────────────────────────────────────────────

const ManagementTrainingPlanForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const isEdit = Boolean(id);
  const baseRoute = isAdmin ? "/treinos/gestao" : "/treinos/profissional";

  // Plan fields
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planObjective, setPlanObjective] = useState<ETrainingObjective | "">("");
  const [planLevel, setPlanLevel] = useState<ETrainingLevel | "">("");
  const [planInstructions, setPlanInstructions] = useState("");
  const [planMinDays, setPlanMinDays] = useState("30");
  const [workouts, setWorkouts] = useState<WorkoutForm[]>([emptyWorkout(1)]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Load existing plan for editing ──────────────────────────────────────────

  useEffect(() => {
    if (!isEdit || !id) return;

    const loadPlan = async () => {
      setLoading(true);
      try {
        const res = isAdmin
          ? await adminGetTrainingPlan(id)
          : await profGetManagedPlan(id);

        if (!res.data) {
          setErrors(["Plano não encontrado."]);
          return;
        }
        populateForm(res.data);
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Erro ao carregar plano."]);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [id]);

  const populateForm = (plan: TrainingPlanDto) => {
    setPlanName(plan.name);
    setPlanDescription(plan.description);
    setPlanObjective(plan.objective);
    setPlanLevel(plan.level);
    setPlanInstructions(plan.instructions ?? "");
    setPlanMinDays(String(plan.minimumDurationDays));
    setWorkouts(
      (plan.workouts ?? [])
        .sort((a, b) => a.order - b.order)
        .map((w) => ({
          id: w.id,
          name: w.name,
          description: w.description ?? "",
          instructions: w.instructions ?? "",
          order: w.order,
          collapsed: false,
          items: (w.items ?? [])
            .filter((i) => i.status === 1)
            .sort((a, b) => a.order - b.order)
            .map((i) => ({
              id: i.id,
              name: i.name,
              description: i.description ?? "",
              instructions: i.instructions ?? "",
              sets: i.sets != null ? String(i.sets) : "",
              repetitions: i.repetitions != null ? String(i.repetitions) : "",
              order: i.order,
            })),
        }))
    );
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!planName.trim()) errs.push("O nome do plano é obrigatório.");
    else if (planName.trim().length < 3) errs.push("O nome deve ter no mínimo 3 caracteres.");
    else if (planName.trim().length > 150) errs.push("O nome deve ter no máximo 150 caracteres.");

    if (!planDescription.trim()) errs.push("A descrição é obrigatória.");
    else if (planDescription.trim().length > 4000) errs.push("A descrição deve ter no máximo 4000 caracteres.");

    if (planObjective === "") errs.push("O objetivo é obrigatório.");
    if (planLevel === "") errs.push("O nível é obrigatório.");

    const minDaysNum = parseInt(planMinDays, 10);
    if (isNaN(minDaysNum) || minDaysNum < 1) errs.push("A duração mínima deve ser de pelo menos 1 dia.");

    if (workouts.length === 0) errs.push("O plano deve ter pelo menos 1 treino.");

    workouts.forEach((w, wi) => {
      if (!w.name.trim()) errs.push(`Treino ${wi + 1}: o nome é obrigatório.`);
      if (w.items.length === 0) errs.push(`Treino ${wi + 1} deve ter pelo menos 1 exercício.`);
      w.items.forEach((item, ii) => {
        if (!item.name.trim()) errs.push(`Treino ${wi + 1}, exercício ${ii + 1}: o nome é obrigatório.`);
      });
    });

    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors([]);
    setSaving(true);

    const workoutsPayload = workouts.map((w, wi) => ({
      ...(isEdit && w.id ? { id: w.id } : {}),
      name: w.name.trim(),
      description: w.description.trim() || undefined,
      instructions: w.instructions.trim() || undefined,
      order: wi + 1,
      items: w.items.map((item, ii) => ({
        ...(isEdit && item.id ? { id: item.id } : {}),
        name: item.name.trim(),
        description: item.description.trim() || undefined,
        instructions: item.instructions.trim() || undefined,
        sets: item.sets !== "" ? parseInt(item.sets, 10) : undefined,
        repetitions: item.repetitions !== "" ? parseInt(item.repetitions, 10) : undefined,
        order: ii + 1,
      })),
    }));

    const planPayload = {
      name: planName.trim(),
      description: planDescription.trim(),
      objective: planObjective as ETrainingObjective,
      level: planLevel as ETrainingLevel,
      instructions: planInstructions.trim() || undefined,
      minimumDurationDays: parseInt(planMinDays, 10),
      workouts: workoutsPayload,
    };

    try {
      let res;
      if (isEdit && id) {
        res = isAdmin
          ? await adminUpdateTrainingPlan(id, planPayload)
          : await profUpdateManagedPlan(id, planPayload);
        toast.success("Plano atualizado com sucesso!");
      } else {
        res = isAdmin
          ? await adminCreateTrainingPlan(planPayload)
          : await profCreateManagedPlan(planPayload);
        toast.success("Plano criado com sucesso!", {
          description: `"${planName.trim()}" está pronto. Ative-o para disponibilizar aos usuários.`,
        });
      }

      navigate(`${baseRoute}/${res.data!.id}`);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Erro ao salvar plano."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  // ── Workout helpers ──────────────────────────────────────────────────────────

  const addWorkout = () => {
    setWorkouts((prev) => [...prev, emptyWorkout(prev.length + 1)]);
  };

  const removeWorkout = (wi: number) => {
    setWorkouts((prev) => prev.filter((_, i) => i !== wi));
  };

  const updateWorkout = (wi: number, patch: Partial<WorkoutForm>) => {
    setWorkouts((prev) =>
      prev.map((w, i) => (i === wi ? { ...w, ...patch } : w))
    );
  };

  const addItem = (wi: number) => {
    setWorkouts((prev) =>
      prev.map((w, i) =>
        i === wi
          ? { ...w, items: [...w.items, emptyItem(w.items.length + 1)] }
          : w
      )
    );
  };

  const removeItem = (wi: number, ii: number) => {
    setWorkouts((prev) =>
      prev.map((w, i) =>
        i === wi ? { ...w, items: w.items.filter((_, j) => j !== ii) } : w
      )
    );
  };

  const updateItem = (wi: number, ii: number, patch: Partial<ItemForm>) => {
    setWorkouts((prev) =>
      prev.map((w, i) =>
        i === wi
          ? {
              ...w,
              items: w.items.map((item, j) =>
                j === ii ? { ...item, ...patch } : item
              ),
            }
          : w
      )
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-[5%] py-5">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60";

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Link
          to={baseRoute}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {isAdmin ? "Gerenciar Planos" : "Meus Planos"}
        </Link>

        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              {isEdit ? "Editar Plano de Treino" : "Criar Plano de Treino"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEdit
                ? "Atualize os dados do plano. Os treinos existentes podem ser editados ou removidos."
                : "Preencha os dados do plano e adicione os treinos com seus exercícios."}
            </p>
          </div>

          <div className="h-px bg-border" />

          {errors.length > 0 && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 space-y-1">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">Corrija os erros abaixo:</span>
              </div>
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-destructive pl-6">• {err}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Dados do Plano ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dados do Plano
              </h3>

              {/* Nome */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                  Nome <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ex: Treino de Força para Iniciantes"
                  maxLength={150}
                  disabled={saving}
                  className={inputCls}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Mínimo 3 caracteres</span>
                  <span className="text-xs text-muted-foreground">{planName.length}/150</span>
                </div>
              </div>

              {/* Objetivo + Nível */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                    Objetivo <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={planObjective}
                    onChange={(e) =>
                      setPlanObjective(
                        e.target.value === "" ? "" : (Number(e.target.value) as ETrainingObjective)
                      )
                    }
                    disabled={saving}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Selecione o objetivo
                    </option>
                    {Object.entries(TrainingObjectiveLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                    Nível <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={planLevel}
                    onChange={(e) =>
                      setPlanLevel(
                        e.target.value === "" ? "" : (Number(e.target.value) as ETrainingLevel)
                      )
                    }
                    disabled={saving}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Selecione o nível
                    </option>
                    {Object.entries(TrainingLevelLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duração mínima */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                  Duração Mínima (dias) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={planMinDays}
                  onChange={(e) => setPlanMinDays(e.target.value)}
                  min={1}
                  max={365}
                  disabled={saving}
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Número mínimo de dias de progresso para considerar o plano concluído.
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                  Descrição <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Descreva o plano: objetivos, público-alvo, benefícios esperados..."
                  rows={4}
                  maxLength={4000}
                  disabled={saving}
                  className={`${inputCls} resize-none`}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-muted-foreground">{planDescription.length}/4000</span>
                </div>
              </div>

              {/* Instruções */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                  Instruções Gerais
                </label>
                <textarea
                  value={planInstructions}
                  onChange={(e) => setPlanInstructions(e.target.value)}
                  placeholder="Orientações gerais, dicas de aquecimento, frequência semanal recomendada..."
                  rows={3}
                  disabled={saving}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* ── Treinos ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Treinos ({workouts.length})
                </h3>
                <button
                  type="button"
                  onClick={addWorkout}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Treino
                </button>
              </div>

              {workouts.map((workout, wi) => (
                <WorkoutBlock
                  key={wi}
                  workout={workout}
                  workoutIndex={wi}
                  saving={saving}
                  onUpdate={(patch) => updateWorkout(wi, patch)}
                  onRemove={() => removeWorkout(wi)}
                  onAddItem={() => addItem(wi)}
                  onRemoveItem={(ii) => removeItem(wi, ii)}
                  onUpdateItem={(ii, patch) => updateItem(wi, ii, patch)}
                  inputCls={inputCls}
                />
              ))}

              {workouts.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center gap-3 text-muted-foreground">
                  <GripVertical className="w-6 h-6" />
                  <p className="text-sm">Nenhum treino adicionado. Clique em "Adicionar Treino" para começar.</p>
                </div>
              )}
            </section>

            <div className="h-px bg-border" />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                ) : isEdit ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Plano"
                )}
              </button>
              <Link
                to={isEdit && id ? `${baseRoute}/${id}` : baseRoute}
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

// ── WorkoutBlock ───────────────────────────────────────────────────────────────

interface WorkoutBlockProps {
  workout: WorkoutForm;
  workoutIndex: number;
  saving: boolean;
  onUpdate: (patch: Partial<WorkoutForm>) => void;
  onRemove: () => void;
  onAddItem: () => void;
  onRemoveItem: (ii: number) => void;
  onUpdateItem: (ii: number, patch: Partial<ItemForm>) => void;
  inputCls: string;
}

const WorkoutBlock = ({
  workout,
  workoutIndex,
  saving,
  onUpdate,
  onRemove,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  inputCls,
}: WorkoutBlockProps) => (
  <div className="rounded-xl border border-border bg-secondary/20 overflow-hidden">
    {/* Workout header */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/40">
      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
        Treino {workoutIndex + 1}
        {workout.name && ` — ${workout.name}`}
      </span>
      <button
        type="button"
        onClick={() => onUpdate({ collapsed: !workout.collapsed })}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        {workout.collapsed ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={saving}
        className="text-destructive/70 hover:text-destructive transition-colors p-1 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    {!workout.collapsed && (
      <div className="p-4 space-y-4">
        {/* Workout fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Nome <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={workout.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Ex: Peito e Tríceps"
              maxLength={100}
              disabled={saving}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Descrição
            </label>
            <input
              type="text"
              value={workout.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Breve descrição do treino"
              maxLength={500}
              disabled={saving}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Instruções
            </label>
            <input
              type="text"
              value={workout.instructions}
              onChange={(e) => onUpdate({ instructions: e.target.value })}
              placeholder="Ex: Descanso de 60s entre séries"
              maxLength={500}
              disabled={saving}
              className={inputCls}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Exercícios ({workout.items.length})
            </p>
            <button
              type="button"
              onClick={onAddItem}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Exercício
            </button>
          </div>

          {workout.items.map((item, ii) => (
            <ItemRow
              key={ii}
              item={item}
              itemIndex={ii}
              saving={saving}
              onUpdate={(patch) => onUpdateItem(ii, patch)}
              onRemove={() => onRemoveItem(ii)}
              inputCls={inputCls}
            />
          ))}

          {workout.items.length === 0 && (
            <p className="text-xs text-muted-foreground italic px-1">
              Nenhum exercício. Clique em "Adicionar Exercício".
            </p>
          )}
        </div>
      </div>
    )}
  </div>
);

// ── ItemRow ────────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ItemForm;
  itemIndex: number;
  saving: boolean;
  onUpdate: (patch: Partial<ItemForm>) => void;
  onRemove: () => void;
  inputCls: string;
}

const ItemRow = ({ item, itemIndex, saving, onUpdate, onRemove, inputCls }: ItemRowProps) => (
  <div className="rounded-lg border border-border/60 bg-background/30 p-3 space-y-3">
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium shrink-0 w-5 text-right">
        {itemIndex + 1}.
      </span>
      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Nome do exercício *"
        maxLength={100}
        disabled={saving}
        className={`${inputCls} flex-1`}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={saving}
        className="text-destructive/70 hover:text-destructive transition-colors p-1 shrink-0 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-7">
      <input
        type="number"
        value={item.sets}
        onChange={(e) => onUpdate({ sets: e.target.value })}
        placeholder="Séries"
        min={1}
        disabled={saving}
        className={inputCls}
      />
      <input
        type="number"
        value={item.repetitions}
        onChange={(e) => onUpdate({ repetitions: e.target.value })}
        placeholder="Reps"
        min={1}
        disabled={saving}
        className={inputCls}
      />
      <input
        type="text"
        value={item.instructions}
        onChange={(e) => onUpdate({ instructions: e.target.value })}
        placeholder="Instruções"
        maxLength={300}
        disabled={saving}
        className={`${inputCls} sm:col-span-2`}
      />
    </div>
  </div>
);

export default ManagementTrainingPlanForm;
