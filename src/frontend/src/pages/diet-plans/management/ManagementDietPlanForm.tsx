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
  EDietObjective,
  EDietLevel,
  EMealPeriod,
  dietObjectiveLabels,
  dietLevelLabels,
  mealPeriodLabels,
  DietPlanDto,
  adminGetDietPlan,
  adminCreateDietPlan,
  adminUpdateDietPlan,
  profGetManagedDietPlan,
  profCreateDietPlan,
  profUpdateDietPlan,
} from "@/lib/diet-plans-api";

// ── Form types ─────────────────────────────────────────────────────────────────

interface ItemForm {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  quantity: string;
  unit: string;
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
  order: number;
}

interface MealForm {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  period: EMealPeriod | "";
  order: number;
  items: ItemForm[];
  collapsed: boolean;
}

const emptyItem = (order: number): ItemForm => ({
  name: "",
  description: "",
  instructions: "",
  quantity: "",
  unit: "g",
  calories: "",
  protein: "",
  carbohydrates: "",
  fat: "",
  order,
});

const emptyMeal = (order: number): MealForm => ({
  name: "",
  description: "",
  instructions: "",
  period: EMealPeriod.Breakfast,
  order,
  items: [emptyItem(1)],
  collapsed: false,
});

// ── Component ──────────────────────────────────────────────────────────────────

const ManagementDietPlanForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const isEdit = Boolean(id);
  const baseRoute = isAdmin ? "/dieta/gestao" : "/dieta/profissional";

  // Plan fields
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planObjective, setPlanObjective] = useState<EDietObjective | "">("");
  const [planLevel, setPlanLevel] = useState<EDietLevel | "">("");
  const [planInstructions, setPlanInstructions] = useState("");
  const [planMinDays, setPlanMinDays] = useState("30");
  const [meals, setMeals] = useState<MealForm[]>([emptyMeal(1)]);

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
          ? await adminGetDietPlan(id)
          : await profGetManagedDietPlan(id);

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

  const populateForm = (plan: DietPlanDto) => {
    setPlanName(plan.name);
    setPlanDescription(plan.description);
    setPlanObjective(plan.objective);
    setPlanLevel(plan.level);
    setPlanInstructions(plan.instructions ?? "");
    setPlanMinDays(String(plan.minimumDurationDays));
    setMeals(
      (plan.meals ?? [])
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description ?? "",
          instructions: m.instructions ?? "",
          period: m.period,
          order: m.order,
          collapsed: false,
          items: (m.items ?? [])
            .sort((a, b) => a.order - b.order)
            .map((it) => ({
              id: it.id,
              name: it.name,
              description: it.description ?? "",
              instructions: it.instructions ?? "",
              quantity: String(it.quantity),
              unit: it.unit,
              calories: it.calories != null ? String(it.calories) : "",
              protein: it.protein != null ? String(it.protein) : "",
              carbohydrates: it.carbohydrates != null ? String(it.carbohydrates) : "",
              fat: it.fat != null ? String(it.fat) : "",
              order: it.order,
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

    if (meals.length === 0) errs.push("O plano deve ter pelo menos 1 refeição.");

    meals.forEach((meal, mi) => {
      if (!meal.name.trim()) errs.push(`Refeição ${mi + 1}: o nome é obrigatório.`);
      if (meal.items.length === 0) errs.push(`Refeição ${mi + 1} deve ter pelo menos 1 item.`);
      meal.items.forEach((item, ii) => {
        if (!item.name.trim())
          errs.push(`Refeição ${mi + 1}, item ${ii + 1}: o nome é obrigatório.`);
        if (!item.quantity || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0)
          errs.push(`Refeição ${mi + 1}, item ${ii + 1}: a quantidade deve ser maior que zero.`);
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

    const mealsPayload = meals.map((m, mi) => ({
      ...(isEdit && m.id ? { id: m.id } : {}),
      name: m.name.trim(),
      description: m.description.trim() || undefined,
      instructions: m.instructions.trim() || undefined,
      period: m.period as EMealPeriod,
      order: mi + 1,
      items: m.items.map((it, ii) => ({
        ...(isEdit && it.id ? { id: it.id } : {}),
        name: it.name.trim(),
        description: it.description.trim() || undefined,
        instructions: it.instructions.trim() || undefined,
        quantity: Number(it.quantity),
        unit: it.unit,
        order: ii + 1,
        calories: it.calories !== "" ? Number(it.calories) : undefined,
        protein: it.protein !== "" ? Number(it.protein) : undefined,
        carbohydrates: it.carbohydrates !== "" ? Number(it.carbohydrates) : undefined,
        fat: it.fat !== "" ? Number(it.fat) : undefined,
      })),
    }));

    const planPayload = {
      name: planName.trim(),
      description: planDescription.trim(),
      objective: planObjective as EDietObjective,
      level: planLevel as EDietLevel,
      instructions: planInstructions.trim() || undefined,
      minimumDurationDays: parseInt(planMinDays, 10),
      meals: mealsPayload,
    };

    try {
      let res;
      if (isEdit && id) {
        res = isAdmin
          ? await adminUpdateDietPlan(id, planPayload)
          : await profUpdateDietPlan(id, planPayload);
        toast.success("Plano atualizado com sucesso!");
      } else {
        res = isAdmin
          ? await adminCreateDietPlan(planPayload)
          : await profCreateDietPlan(planPayload);
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

  // ── Meal helpers ─────────────────────────────────────────────────────────────

  const addMeal = () => {
    setMeals((prev) => [...prev, emptyMeal(prev.length + 1)]);
  };

  const removeMeal = (mi: number) => {
    setMeals((prev) => prev.filter((_, i) => i !== mi));
  };

  const updateMeal = (mi: number, patch: Partial<MealForm>) => {
    setMeals((prev) => prev.map((m, i) => (i === mi ? { ...m, ...patch } : m)));
  };

  const addItem = (mi: number) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mi ? { ...m, items: [...m.items, emptyItem(m.items.length + 1)] } : m
      )
    );
  };

  const removeItem = (mi: number, ii: number) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mi ? { ...m, items: m.items.filter((_, j) => j !== ii) } : m
      )
    );
  };

  const updateItem = (mi: number, ii: number, patch: Partial<ItemForm>) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mi
          ? { ...m, items: m.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) }
          : m
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
              {isEdit ? "Editar Plano Alimentar" : "Criar Plano Alimentar"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEdit
                ? "Atualize os dados do plano. As refeições existentes podem ser editadas ou removidas."
                : "Preencha os dados do plano e adicione as refeições com seus itens."}
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
                  placeholder="Ex: Dieta Hipertrofia Intermediária"
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
                        e.target.value === "" ? "" : (Number(e.target.value) as EDietObjective)
                      )
                    }
                    disabled={saving}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Selecione o objetivo
                    </option>
                    {Object.entries(dietObjectiveLabels).map(([k, v]) => (
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
                        e.target.value === "" ? "" : (Number(e.target.value) as EDietLevel)
                      )
                    }
                    disabled={saving}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Selecione o nível
                    </option>
                    {Object.entries(dietLevelLabels).map(([k, v]) => (
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
                  placeholder="Orientações gerais, dicas de preparo, horários recomendados..."
                  rows={3}
                  disabled={saving}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* ── Refeições ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Refeições ({meals.length})
                </h3>
                <button
                  type="button"
                  onClick={addMeal}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Refeição
                </button>
              </div>

              {meals.map((meal, mi) => (
                <MealBlock
                  key={mi}
                  meal={meal}
                  mealIndex={mi}
                  saving={saving}
                  onUpdate={(patch) => updateMeal(mi, patch)}
                  onRemove={() => removeMeal(mi)}
                  onAddItem={() => addItem(mi)}
                  onRemoveItem={(ii) => removeItem(mi, ii)}
                  onUpdateItem={(ii, patch) => updateItem(mi, ii, patch)}
                  inputCls={inputCls}
                />
              ))}

              {meals.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center gap-3 text-muted-foreground">
                  <GripVertical className="w-6 h-6" />
                  <p className="text-sm">Nenhuma refeição adicionada. Clique em "Adicionar Refeição" para começar.</p>
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

// ── MealBlock ──────────────────────────────────────────────────────────────────

interface MealBlockProps {
  meal: MealForm;
  mealIndex: number;
  saving: boolean;
  onUpdate: (patch: Partial<MealForm>) => void;
  onRemove: () => void;
  onAddItem: () => void;
  onRemoveItem: (ii: number) => void;
  onUpdateItem: (ii: number, patch: Partial<ItemForm>) => void;
  inputCls: string;
}

const MealBlock = ({
  meal,
  mealIndex,
  saving,
  onUpdate,
  onRemove,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  inputCls,
}: MealBlockProps) => (
  <div className="rounded-xl border border-border bg-secondary/20 overflow-hidden">
    {/* Meal header */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/40">
      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
        Refeição {mealIndex + 1}
        {meal.name && ` — ${meal.name}`}
      </span>
      <button
        type="button"
        onClick={() => onUpdate({ collapsed: !meal.collapsed })}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        {meal.collapsed ? (
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

    {!meal.collapsed && (
      <div className="p-4 space-y-4">
        {/* Meal fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Nome <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={meal.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Ex: Café da Manhã"
              maxLength={100}
              disabled={saving}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Período
            </label>
            <select
              value={meal.period}
              onChange={(e) => onUpdate({ period: Number(e.target.value) as EMealPeriod })}
              disabled={saving}
              className={inputCls}
            >
              {Object.entries(mealPeriodLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Descrição
            </label>
            <input
              type="text"
              value={meal.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Breve descrição da refeição"
              maxLength={500}
              disabled={saving}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-muted-foreground mb-1 font-medium">
              Instruções
            </label>
            <input
              type="text"
              value={meal.instructions}
              onChange={(e) => onUpdate({ instructions: e.target.value })}
              placeholder="Ex: Consumir até 30min após acordar"
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
              Itens ({meal.items.length})
            </p>
            <button
              type="button"
              onClick={onAddItem}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Item
            </button>
          </div>

          {meal.items.map((item, ii) => (
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

          {meal.items.length === 0 && (
            <p className="text-xs text-muted-foreground italic px-1">
              Nenhum item. Clique em "Adicionar Item".
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
        placeholder="Nome do alimento *"
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
        value={item.quantity}
        onChange={(e) => onUpdate({ quantity: e.target.value })}
        placeholder="Qtd *"
        step="0.01"
        min={0}
        disabled={saving}
        className={inputCls}
      />
      <input
        type="text"
        value={item.unit}
        onChange={(e) => onUpdate({ unit: e.target.value })}
        placeholder="Unidade"
        maxLength={20}
        disabled={saving}
        className={inputCls}
      />
      <input
        type="number"
        value={item.calories}
        onChange={(e) => onUpdate({ calories: e.target.value })}
        placeholder="Kcal"
        step="0.1"
        min={0}
        disabled={saving}
        className={inputCls}
      />
      <input
        type="number"
        value={item.protein}
        onChange={(e) => onUpdate({ protein: e.target.value })}
        placeholder="Prot (g)"
        step="0.1"
        min={0}
        disabled={saving}
        className={inputCls}
      />
      <input
        type="number"
        value={item.carbohydrates}
        onChange={(e) => onUpdate({ carbohydrates: e.target.value })}
        placeholder="Carb (g)"
        step="0.1"
        min={0}
        disabled={saving}
        className={`${inputCls} sm:col-span-2`}
      />
      <input
        type="number"
        value={item.fat}
        onChange={(e) => onUpdate({ fat: e.target.value })}
        placeholder="Gord (g)"
        step="0.1"
        min={0}
        disabled={saving}
        className={`${inputCls} sm:col-span-2`}
      />
    </div>
  </div>
);

export default ManagementDietPlanForm;
