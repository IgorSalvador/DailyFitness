import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  EDietObjective,
  EDietLevel,
  EMealPeriod,
  dietObjectiveLabels,
  dietLevelLabels,
  mealPeriodLabels,
  CreateDietPlanPayload,
  adminGetDietPlan,
  adminCreateDietPlan,
  adminUpdateDietPlan,
  profGetManagedDietPlan,
  profCreateDietPlan,
  profUpdateDietPlan,
} from "@/lib/diet-plans-api";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

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
  period: EMealPeriod;
  order: number;
  items: ItemForm[];
  collapsed: boolean;
}

const emptyItem = (order: number): ItemForm => ({
  name: "", description: "", instructions: "", quantity: "", unit: "g",
  calories: "", protein: "", carbohydrates: "", fat: "", order,
});

const emptyMeal = (order: number): MealForm => ({
  name: "", description: "", instructions: "", period: EMealPeriod.Breakfast,
  order, items: [emptyItem(1)], collapsed: false,
});

const ItemRow = ({
  item, mealIdx, itemIdx, onChange, onRemove,
}: {
  item: ItemForm; mealIdx: number; itemIdx: number;
  onChange: (v: Partial<ItemForm>) => void;
  onRemove: () => void;
}) => (
  <div className="bg-secondary/40 rounded-lg p-3 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground font-medium">Item {itemIdx + 1}</span>
      <button type="button" onClick={onRemove} className="text-destructive hover:text-red-400 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <input
        placeholder="Nome do item *"
        value={item.name}
        onChange={e => onChange({ name: e.target.value })}
        className="col-span-2 bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Descrição"
        value={item.description}
        onChange={e => onChange({ description: e.target.value })}
        className="col-span-2 bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Quantidade *"
        type="number"
        step="0.01"
        min="0"
        value={item.quantity}
        onChange={e => onChange({ quantity: e.target.value })}
        className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Unidade (ex: g, ml)"
        value={item.unit}
        onChange={e => onChange({ unit: e.target.value })}
        className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Calorias (kcal)"
        type="number" step="0.1" min="0"
        value={item.calories}
        onChange={e => onChange({ calories: e.target.value })}
        className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Proteína (g)"
        type="number" step="0.1" min="0"
        value={item.protein}
        onChange={e => onChange({ protein: e.target.value })}
        className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Carboidratos (g)"
        type="number" step="0.1" min="0"
        value={item.carbohydrates}
        onChange={e => onChange({ carbohydrates: e.target.value })}
        className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        placeholder="Gorduras (g)"
        type="number" step="0.1" min="0"
        value={item.fat}
        onChange={e => onChange({ fat: e.target.value })}
        className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  </div>
);

const MealBlock = ({
  meal, mealIdx, onChange, onRemove, onToggle,
}: {
  meal: MealForm; mealIdx: number;
  onChange: (v: Partial<MealForm>) => void;
  onRemove: () => void;
  onToggle: () => void;
}) => {
  const updateItem = (itemIdx: number, v: Partial<ItemForm>) => {
    const items = [...meal.items];
    items[itemIdx] = { ...items[itemIdx], ...v };
    onChange({ items });
  };

  const addItem = () => onChange({ items: [...meal.items, emptyItem(meal.items.length + 1)] });

  const removeItem = (itemIdx: number) =>
    onChange({ items: meal.items.filter((_, i) => i !== itemIdx).map((it, i) => ({ ...it, order: i + 1 })) });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30">
        <GripVertical size={14} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium flex-1">Refeição {mealIdx + 1}</span>
        <button type="button" onClick={onToggle} className="text-muted-foreground hover:text-foreground p-1">
          {meal.collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
        <button type="button" onClick={onRemove} className="text-destructive hover:text-red-400 p-1">
          <Trash2 size={14} />
        </button>
      </div>

      {!meal.collapsed && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Nome da refeição *"
              value={meal.name}
              onChange={e => onChange({ name: e.target.value })}
              className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={meal.period}
              onChange={e => onChange({ period: Number(e.target.value) as EMealPeriod })}
              className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {Object.values(EMealPeriod).filter(v => typeof v === "number").map(v => (
                <option key={v} value={v}>{mealPeriodLabels[v as EMealPeriod]}</option>
              ))}
            </select>
            <input
              placeholder="Descrição"
              value={meal.description}
              onChange={e => onChange({ description: e.target.value })}
              className="md:col-span-2 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              placeholder="Instruções (opcional)"
              rows={2}
              value={meal.instructions}
              onChange={e => onChange({ instructions: e.target.value })}
              className="md:col-span-2 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Itens</span>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={12} /> Adicionar item
              </button>
            </div>
            {meal.items.map((item, itemIdx) => (
              <ItemRow
                key={itemIdx} item={item} mealIdx={mealIdx} itemIdx={itemIdx}
                onChange={v => updateItem(itemIdx, v)}
                onRemove={() => removeItem(itemIdx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManagementDietPlanForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const role = getUser()?.role;
  const isAdmin = role === "Administrator";
  const basePath = isAdmin ? "/dieta/gestao" : "/dieta/profissional";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState<EDietObjective>(EDietObjective.WeightLoss);
  const [level, setLevel] = useState<EDietLevel>(EDietLevel.Basic);
  const [minDays, setMinDays] = useState("7");
  const [instructions, setInstructions] = useState("");
  const [meals, setMeals] = useState<MealForm[]>([emptyMeal(1)]);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchFn = isAdmin ? adminGetDietPlan : (planId: string) => profGetManagedDietPlan(planId);
    fetchFn(id).then(res => {
      const plan = res.data;
      if (!plan) return;
      setName(plan.name);
      setDescription(plan.description);
      setObjective(plan.objective);
      setLevel(plan.level);
      setMinDays(String(plan.minimumDurationDays));
      setInstructions(plan.instructions ?? "");
      setMeals(plan.meals.map((m, mi) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        instructions: m.instructions ?? "",
        period: m.period,
        order: mi + 1,
        collapsed: false,
        items: m.items.map((it, ii) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          instructions: it.instructions ?? "",
          quantity: String(it.quantity),
          unit: it.unit,
          calories: it.calories != null ? String(it.calories) : "",
          protein: it.protein != null ? String(it.protein) : "",
          carbohydrates: it.carbohydrates != null ? String(it.carbohydrates) : "",
          fat: it.fat != null ? String(it.fat) : "",
          order: ii + 1,
        })),
      })));
    }).catch(() => toast.error("Erro ao carregar plano."))
      .finally(() => setLoading(false));
  }, [id, isEdit, isAdmin]);

  const updateMeal = (mealIdx: number, v: Partial<MealForm>) => {
    const updated = [...meals];
    updated[mealIdx] = { ...updated[mealIdx], ...v };
    setMeals(updated);
  };

  const addMeal = () => setMeals([...meals, emptyMeal(meals.length + 1)]);
  const removeMeal = (idx: number) =>
    setMeals(meals.filter((_, i) => i !== idx).map((m, i) => ({ ...m, order: i + 1 })));

  const buildPayload = (): CreateDietPlanPayload => ({
    name, description, objective, level,
    minimumDurationDays: Number(minDays),
    instructions: instructions || undefined,
    meals: meals.map((m, mi) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      period: m.period,
      order: mi + 1,
      instructions: m.instructions || undefined,
      items: m.items.map((it, ii) => ({
        id: it.id,
        name: it.name,
        description: it.description,
        quantity: Number(it.quantity),
        unit: it.unit,
        order: ii + 1,
        instructions: it.instructions || undefined,
        calories: it.calories ? Number(it.calories) : undefined,
        protein: it.protein ? Number(it.protein) : undefined,
        carbohydrates: it.carbohydrates ? Number(it.carbohydrates) : undefined,
        fat: it.fat ? Number(it.fat) : undefined,
      })),
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit && id) {
        const fn = isAdmin ? adminUpdateDietPlan : profUpdateDietPlan;
        await fn(id, payload);
        toast.success("Plano atualizado com sucesso!");
      } else {
        const fn = isAdmin ? adminCreateDietPlan : profCreateDietPlan;
        await fn(payload);
        toast.success("Plano criado com sucesso!");
      }
      navigate(basePath);
    } catch {
      toast.error("Erro ao salvar plano. Verifique os dados.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(basePath)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <h2 className="text-2xl font-bold gradient-text">
          {isEdit ? "Editar Plano Alimentar" : "Novo Plano Alimentar"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold">Informações gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Nome do plano *"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="md:col-span-2 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                placeholder="Descrição *"
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="md:col-span-2 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <select
                value={objective}
                onChange={e => setObjective(Number(e.target.value) as EDietObjective)}
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.values(EDietObjective).filter(v => typeof v === "number").map(v => (
                  <option key={v} value={v}>{dietObjectiveLabels[v as EDietObjective]}</option>
                ))}
              </select>
              <select
                value={level}
                onChange={e => setLevel(Number(e.target.value) as EDietLevel)}
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.values(EDietLevel).filter(v => typeof v === "number").map(v => (
                  <option key={v} value={v}>{dietLevelLabels[v as EDietLevel]}</option>
                ))}
              </select>
              <input
                placeholder="Duração mínima (dias) *"
                type="number" min="1" required
                value={minDays}
                onChange={e => setMinDays(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                placeholder="Instruções gerais (opcional)"
                rows={2}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="md:col-span-2 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Refeições</h3>
              <button type="button" onClick={addMeal}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Plus size={14} /> Adicionar refeição
              </button>
            </div>
            {meals.map((meal, mealIdx) => (
              <MealBlock
                key={mealIdx} meal={meal} mealIdx={mealIdx}
                onChange={v => updateMeal(mealIdx, v)}
                onRemove={() => removeMeal(mealIdx)}
                onToggle={() => updateMeal(mealIdx, { collapsed: !meal.collapsed })}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="px-5 py-2.5 rounded-lg text-sm border border-border hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar plano"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
