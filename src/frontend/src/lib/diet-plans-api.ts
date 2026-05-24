import { ApiResponse } from "./api";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum EDietObjective {
  WeightLoss = 1,
  MuscleGain = 2,
  Maintenance = 3,
  HealthImprovement = 4,
  PerformanceEnhancement = 5,
}

export enum EDietLevel {
  Basic = 1,
  Intermediate = 2,
  Advanced = 3,
}

export enum EUserDietPlanStatus {
  Active = 1,
  Cancelled = 2,
  Completed = 3,
}

export enum EMealPeriod {
  Breakfast = 1,
  MorningSnack = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
  NightSnack = 6,
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const dietObjectiveLabels: Record<EDietObjective, string> = {
  [EDietObjective.WeightLoss]: "Perda de Peso",
  [EDietObjective.MuscleGain]: "Ganho de Massa",
  [EDietObjective.Maintenance]: "Manutenção",
  [EDietObjective.HealthImprovement]: "Melhora da Saúde",
  [EDietObjective.PerformanceEnhancement]: "Performance",
};

export const dietLevelLabels: Record<EDietLevel, string> = {
  [EDietLevel.Basic]: "Básico",
  [EDietLevel.Intermediate]: "Intermediário",
  [EDietLevel.Advanced]: "Avançado",
};

export const userDietPlanStatusLabels: Record<EUserDietPlanStatus, string> = {
  [EUserDietPlanStatus.Active]: "Ativo",
  [EUserDietPlanStatus.Cancelled]: "Cancelado",
  [EUserDietPlanStatus.Completed]: "Concluído",
};

export const mealPeriodLabels: Record<EMealPeriod, string> = {
  [EMealPeriod.Breakfast]: "Café da Manhã",
  [EMealPeriod.MorningSnack]: "Lanche da Manhã",
  [EMealPeriod.Lunch]: "Almoço",
  [EMealPeriod.AfternoonSnack]: "Lanche da Tarde",
  [EMealPeriod.Dinner]: "Jantar",
  [EMealPeriod.NightSnack]: "Ceia",
};

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface DietMealItemDto {
  id: string;
  name: string;
  description: string;
  instructions?: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  order: number;
}

export interface DietMealDto {
  id: string;
  name: string;
  description: string;
  period: EMealPeriod;
  instructions?: string;
  order: number;
  items: DietMealItemDto[];
}

export interface DietPlanDto {
  id: string;
  name: string;
  description: string;
  objective: EDietObjective;
  level: EDietLevel;
  instructions?: string;
  minimumDurationDays: number;
  status: string;
  createdByUserId?: string;
  mealCount: number;
  subscriberCount: number;
  activeSubscriberCount: number;
  createdAt: string;
  meals: DietMealDto[];
}

export interface UserDietProgressDto {
  id: string;
  dietMealItemId: string;
  progressDate: string;
  isCompleted: boolean;
}

export interface UserDietMealDailyLogDto {
  id: string;
  dietMealId: string;
  logDate: string;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
}

export interface UserDietPlanDto {
  id: string;
  userId: string;
  dietPlanId: string;
  userDietPlanStatus: EUserDietPlanStatus;
  startedAt: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  overallProgress: number;
  dietPlan?: DietPlanDto;
  dailyLogs: UserDietMealDailyLogDto[];
  progresses: UserDietProgressDto[];
}

export interface DietPlanSubscriberDto {
  userId: string;
  userName: string;
  userEmail: string;
  status: EUserDietPlanStatus;
  startedAt: string;
  overallProgress: number;
}

// ── Create/Update Payloads ────────────────────────────────────────────────────

export interface CreateDietMealItemPayload {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  order: number;
  instructions?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

export interface CreateDietMealPayload {
  id?: string;
  name: string;
  description: string;
  period: EMealPeriod;
  order: number;
  instructions?: string;
  items: CreateDietMealItemPayload[];
}

export interface CreateDietPlanPayload {
  name: string;
  description: string;
  objective: EDietObjective;
  level: EDietLevel;
  minimumDurationDays: number;
  instructions?: string;
  meals: CreateDietMealPayload[];
}

export interface UpdateDietPlanPayload extends CreateDietPlanPayload {}

export interface CancelDietPlanPayload {
  userDietPlanId: string;
  reason?: string;
}

export interface MarkDietItemProgressPayload {
  isCompleted: boolean;
}

// ── API helpers ───────────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

const HEADERS = () => ({
  "Content-Type": "application/json",
  ...getAuthHeader(),
});

async function parseApiResponse<T>(
  response: Response,
  context: string
): Promise<ApiResponse<T>> {
  const text = await response.text();
  let parsed: ApiResponse<T> | null = null;

  if (text) {
    try {
      parsed = JSON.parse(text) as ApiResponse<T>;
    } catch {
      // not JSON
    }
  }

  if (!response.ok) {
    throw new Error(
      parsed?.message || `Erro em ${context}. Código: ${response.status}`
    );
  }

  if (!parsed) {
    throw new Error(`Resposta da API (${context}) não é JSON válido`);
  }

  return {
    success: Boolean(parsed.success),
    message: parsed.message ?? "",
    data: parsed.data ?? null,
  };
}

// ── User endpoints ────────────────────────────────────────────────────────────

export async function getAvailableDietPlans(
  objective?: EDietObjective,
  level?: EDietLevel
): Promise<ApiResponse<DietPlanDto[]>> {
  const params = new URLSearchParams();
  if (objective !== undefined) params.set("objective", String(objective));
  if (level !== undefined) params.set("level", String(level));
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/dietplans${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto[]>(res, "getAvailableDietPlans");
}

export async function getDietPlanDetail(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "getDietPlanDetail");
}

export async function subscribeDietPlan(id: string): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/${encodeURIComponent(id)}/subscribe`, {
    method: "POST",
    headers: HEADERS(),
  });
  return parseApiResponse<UserDietPlanDto>(res, "subscribeDietPlan");
}

export async function getCurrentDietPlan(): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/current`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<UserDietPlanDto>(res, "getCurrentDietPlan");
}

export async function getCurrentDietPlanProgress(): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/current/progress`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<UserDietPlanDto>(res, "getCurrentDietPlanProgress");
}

export async function cancelDietPlan(payload: CancelDietPlanPayload): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/current/cancel`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<UserDietPlanDto>(res, "cancelDietPlan");
}

export async function markDietItemProgress(
  mealId: string,
  itemId: string,
  payload: MarkDietItemProgressPayload
): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(
    `${API_BASE}/dietplans/current/meals/${encodeURIComponent(mealId)}/items/${encodeURIComponent(itemId)}/complete`,
    {
      method: "POST",
      headers: HEADERS(),
      body: JSON.stringify(payload),
    }
  );
  return parseApiResponse<UserDietPlanDto>(res, "markDietItemProgress");
}

export async function finishDietMealDay(mealId: string): Promise<ApiResponse<UserDietMealDailyLogDto>> {
  const res = await fetch(
    `${API_BASE}/dietplans/current/meals/${encodeURIComponent(mealId)}/finish-day`,
    {
      method: "POST",
      headers: HEADERS(),
    }
  );
  return parseApiResponse<UserDietMealDailyLogDto>(res, "finishDietMealDay");
}

export async function getDietPlanHistory(): Promise<ApiResponse<UserDietPlanDto[]>> {
  const res = await fetch(`${API_BASE}/dietplans/history`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<UserDietPlanDto[]>(res, "getDietPlanHistory");
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

export async function adminGetAllDietPlans(): Promise<ApiResponse<DietPlanDto[]>> {
  const res = await fetch(`${API_BASE}/dietplans/management`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto[]>(res, "adminGetAllDietPlans");
}

export async function adminGetDietPlan(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/management/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "adminGetDietPlan");
}

export async function adminCreateDietPlan(payload: CreateDietPlanPayload): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/management`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<DietPlanDto>(res, "adminCreateDietPlan");
}

export async function adminUpdateDietPlan(id: string, payload: UpdateDietPlanPayload): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/management/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<DietPlanDto>(res, "adminUpdateDietPlan");
}

export async function adminActivateDietPlan(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/management/${encodeURIComponent(id)}/activate`, {
    method: "PATCH",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "adminActivateDietPlan");
}

export async function adminDeactivateDietPlan(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/management/${encodeURIComponent(id)}/deactivate`, {
    method: "PATCH",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "adminDeactivateDietPlan");
}

export async function adminGetDietPlanSubscribers(id: string): Promise<ApiResponse<DietPlanSubscriberDto[]>> {
  const res = await fetch(`${API_BASE}/dietplans/management/${encodeURIComponent(id)}/subscribers`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanSubscriberDto[]>(res, "adminGetDietPlanSubscribers");
}

export async function adminGetDietSubscriberProgress(planId: string, userId: string): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(
    `${API_BASE}/dietplans/management/${encodeURIComponent(planId)}/subscribers/${encodeURIComponent(userId)}/progress`,
    { method: "GET", headers: HEADERS() }
  );
  return parseApiResponse<UserDietPlanDto>(res, "adminGetDietSubscriberProgress");
}

// ── Professional endpoints ────────────────────────────────────────────────────

export async function profGetManagedDietPlans(): Promise<ApiResponse<DietPlanDto[]>> {
  const res = await fetch(`${API_BASE}/dietplans/managed`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto[]>(res, "profGetManagedDietPlans");
}

export async function profGetManagedDietPlan(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/managed/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "profGetManagedDietPlan");
}

export async function profCreateDietPlan(payload: CreateDietPlanPayload): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/managed`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<DietPlanDto>(res, "profCreateDietPlan");
}

export async function profUpdateDietPlan(id: string, payload: UpdateDietPlanPayload): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/managed/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<DietPlanDto>(res, "profUpdateDietPlan");
}

export async function profActivateDietPlan(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/managed/${encodeURIComponent(id)}/activate`, {
    method: "PATCH",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "profActivateDietPlan");
}

export async function profDeactivateDietPlan(id: string): Promise<ApiResponse<DietPlanDto>> {
  const res = await fetch(`${API_BASE}/dietplans/managed/${encodeURIComponent(id)}/deactivate`, {
    method: "PATCH",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanDto>(res, "profDeactivateDietPlan");
}

export async function profGetDietPlanSubscribers(id: string): Promise<ApiResponse<DietPlanSubscriberDto[]>> {
  const res = await fetch(`${API_BASE}/dietplans/managed/${encodeURIComponent(id)}/subscribers`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<DietPlanSubscriberDto[]>(res, "profGetDietPlanSubscribers");
}

export async function profGetDietSubscriberProgress(planId: string, userId: string): Promise<ApiResponse<UserDietPlanDto>> {
  const res = await fetch(
    `${API_BASE}/dietplans/managed/${encodeURIComponent(planId)}/subscribers/${encodeURIComponent(userId)}/progress`,
    { method: "GET", headers: HEADERS() }
  );
  return parseApiResponse<UserDietPlanDto>(res, "profGetDietSubscriberProgress");
}
