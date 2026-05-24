import { ApiResponse } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ── Enums ──────────────────────────────────────────────────────────────────────

export enum ETrainingObjective {
  WeightLoss = 1,
  MuscleGain = 2,
  Endurance = 3,
  Flexibility = 4,
  GeneralFitness = 5,
  Performance = 6,
}

export enum ETrainingLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export enum EUserTrainingPlanStatus {
  Active = 1,
  Cancelled = 2,
  Completed = 3,
}

// ── Labels ─────────────────────────────────────────────────────────────────────

export const TrainingObjectiveLabel: Record<ETrainingObjective, string> = {
  [ETrainingObjective.WeightLoss]: "Emagrecimento",
  [ETrainingObjective.MuscleGain]: "Hipertrofia",
  [ETrainingObjective.Endurance]: "Resistência",
  [ETrainingObjective.Flexibility]: "Flexibilidade",
  [ETrainingObjective.GeneralFitness]: "Condicionamento Geral",
  [ETrainingObjective.Performance]: "Performance",
};

export const TrainingLevelLabel: Record<ETrainingLevel, string> = {
  [ETrainingLevel.Beginner]: "Iniciante",
  [ETrainingLevel.Intermediate]: "Intermediário",
  [ETrainingLevel.Advanced]: "Avançado",
};

export const UserTrainingPlanStatusLabel: Record<EUserTrainingPlanStatus, string> = {
  [EUserTrainingPlanStatus.Active]: "Ativo",
  [EUserTrainingPlanStatus.Cancelled]: "Cancelado",
  [EUserTrainingPlanStatus.Completed]: "Concluído",
};

// ── Response DTOs ──────────────────────────────────────────────────────────────

export interface TrainingWorkoutItemDto {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  sets: number | null;
  repetitions: number | null;
  order: number;
  status: number;
}

export interface TrainingWorkoutDto {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  order: number;
  status: number;
  items: TrainingWorkoutItemDto[];
}

export interface TrainingPlanDto {
  id: string;
  name: string;
  description: string;
  objective: ETrainingObjective;
  level: ETrainingLevel;
  instructions: string | null;
  minimumDurationDays: number;
  status: number; // 0=Inactive, 1=Active
  createdByUserId: string | null;
  subscriberCount: number;
  activeSubscriberCount: number;
  workouts: TrainingWorkoutDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface UserTrainingProgressDto {
  id: string;
  userTrainingPlanId: string;
  trainingWorkoutId: string;
  trainingWorkoutItemId: string;
  progressDate: string;
  completedAt: string;
  createdAt: string;
}

export interface UserTrainingWorkoutDailyLogDto {
  id: string;
  userTrainingPlanId: string;
  trainingWorkoutId: string;
  progressDate: string;
  progressPercentage: number;
  isFinished: boolean;
  finishedAt: string | null;
  createdAt: string;
}

export interface UserTrainingPlanDto {
  id: string;
  userId: string;
  userFullName: string;
  trainingPlanId: string;
  trainingPlanName: string;
  userTrainingPlanStatus: EUserTrainingPlanStatus;
  startedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  trainingPlan: TrainingPlanDto | null;
  progresses: UserTrainingProgressDto[];
  dailyLogs: UserTrainingWorkoutDailyLogDto[];
  overallProgressPercentage: number;
  totalItemsCompleted: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface TrainingPlanSubscriberDto {
  userTrainingPlanId: string;
  userId: string;
  userFullName: string;
  status: EUserTrainingPlanStatus;
  startedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  overallProgressPercentage: number;
  dailyLogs: UserTrainingWorkoutDailyLogDto[];
}

// ── Request DTOs ───────────────────────────────────────────────────────────────

export interface CreateTrainingWorkoutItemPayload {
  name: string;
  description?: string;
  instructions?: string;
  sets?: number;
  repetitions?: number;
  order: number;
}

export interface CreateTrainingWorkoutPayload {
  name: string;
  description?: string;
  instructions?: string;
  order: number;
  items: CreateTrainingWorkoutItemPayload[];
}

export interface CreateTrainingPlanPayload {
  name: string;
  description: string;
  objective: ETrainingObjective;
  level: ETrainingLevel;
  instructions?: string;
  minimumDurationDays: number;
  workouts: CreateTrainingWorkoutPayload[];
}

export interface UpsertTrainingWorkoutItemPayload {
  id?: string;
  name: string;
  description?: string;
  instructions?: string;
  sets?: number;
  repetitions?: number;
  order: number;
}

export interface UpsertTrainingWorkoutPayload {
  id?: string;
  name: string;
  description?: string;
  instructions?: string;
  order: number;
  items: UpsertTrainingWorkoutItemPayload[];
}

export interface UpdateTrainingPlanPayload {
  name: string;
  description: string;
  objective: ETrainingObjective;
  level: ETrainingLevel;
  instructions?: string;
  minimumDurationDays: number;
  workouts: UpsertTrainingWorkoutPayload[];
}

export interface CancelTrainingPlanPayload {
  reason?: string;
}

export interface MarkTrainingItemProgressPayload {
  progressDate?: string; // ISO date
}

// ── Helpers internos ───────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

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

const BASE = `${API_BASE_URL}/TrainingPlans`;
const HEADERS = () => ({
  "Content-Type": "application/json",
  ...getAuthHeader(),
});

// ── User — Listagem pública ────────────────────────────────────────────────────

export async function getAvailableTrainingPlans(
  objective?: ETrainingObjective,
  level?: ETrainingLevel
): Promise<ApiResponse<TrainingPlanDto[]>> {
  const params = new URLSearchParams();
  if (objective !== undefined) params.append("objective", String(objective));
  if (level !== undefined) params.append("level", String(level));
  const qs = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${BASE}${qs}`, { method: "GET", headers: HEADERS() });
  return parseApiResponse<TrainingPlanDto[]>(res, "getAvailableTrainingPlans");
}

export async function getTrainingPlanDetail(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<TrainingPlanDto>(res, "getTrainingPlanDetail");
}

// ── User — Inscrição ──────────────────────────────────────────────────────────

export async function subscribeTrainingPlan(
  id: string
): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}/subscribe`, {
    method: "POST",
    headers: HEADERS(),
  });
  return parseApiResponse<UserTrainingPlanDto>(res, "subscribeTrainingPlan");
}

// ── User — Plano atual ────────────────────────────────────────────────────────

export async function getCurrentTrainingPlan(): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(`${BASE}/current`, { method: "GET", headers: HEADERS() });
  return parseApiResponse<UserTrainingPlanDto>(res, "getCurrentTrainingPlan");
}

export async function getCurrentTrainingPlanProgress(): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(`${BASE}/current/progress`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<UserTrainingPlanDto>(res, "getCurrentTrainingPlanProgress");
}

export async function cancelTrainingPlan(
  payload: CancelTrainingPlanPayload
): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(`${BASE}/current/cancel`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<UserTrainingPlanDto>(res, "cancelTrainingPlan");
}

export async function markItemProgress(
  workoutId: string,
  itemId: string,
  payload: MarkTrainingItemProgressPayload = {}
): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/current/workouts/${encodeURIComponent(workoutId)}/items/${encodeURIComponent(itemId)}/complete`,
    {
      method: "POST",
      headers: HEADERS(),
      body: JSON.stringify(payload),
    }
  );
  return parseApiResponse<UserTrainingPlanDto>(res, "markItemProgress");
}

export async function finishWorkoutDay(
  workoutId: string
): Promise<ApiResponse<UserTrainingWorkoutDailyLogDto>> {
  const res = await fetch(
    `${BASE}/current/workouts/${encodeURIComponent(workoutId)}/finish-day`,
    {
      method: "POST",
      headers: HEADERS(),
    }
  );
  return parseApiResponse<UserTrainingWorkoutDailyLogDto>(res, "finishWorkoutDay");
}

// ── User — Histórico ──────────────────────────────────────────────────────────

export async function getTrainingPlanHistory(): Promise<ApiResponse<UserTrainingPlanDto[]>> {
  const res = await fetch(`${BASE}/history`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<UserTrainingPlanDto[]>(res, "getTrainingPlanHistory");
}

// ── Admin — Gestão ────────────────────────────────────────────────────────────

export async function adminGetAllTrainingPlans(): Promise<ApiResponse<TrainingPlanDto[]>> {
  const res = await fetch(`${BASE}/management`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<TrainingPlanDto[]>(res, "adminGetAllTrainingPlans");
}

export async function adminGetTrainingPlan(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/management/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<TrainingPlanDto>(res, "adminGetTrainingPlan");
}

export async function adminCreateTrainingPlan(
  payload: CreateTrainingPlanPayload
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/management`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<TrainingPlanDto>(res, "adminCreateTrainingPlan");
}

export async function adminUpdateTrainingPlan(
  id: string,
  payload: UpdateTrainingPlanPayload
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/management/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<TrainingPlanDto>(res, "adminUpdateTrainingPlan");
}

export async function adminActivateTrainingPlan(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/management/${encodeURIComponent(id)}/activate`,
    { method: "PATCH", headers: HEADERS() }
  );
  return parseApiResponse<TrainingPlanDto>(res, "adminActivateTrainingPlan");
}

export async function adminDeactivateTrainingPlan(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/management/${encodeURIComponent(id)}/deactivate`,
    { method: "PATCH", headers: HEADERS() }
  );
  return parseApiResponse<TrainingPlanDto>(res, "adminDeactivateTrainingPlan");
}

export async function adminGetPlanSubscribers(
  id: string
): Promise<ApiResponse<TrainingPlanSubscriberDto[]>> {
  const res = await fetch(
    `${BASE}/management/${encodeURIComponent(id)}/subscribers`,
    { method: "GET", headers: HEADERS() }
  );
  return parseApiResponse<TrainingPlanSubscriberDto[]>(res, "adminGetPlanSubscribers");
}

export async function adminGetSubscriberProgress(
  planId: string,
  userId: string
): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/management/${encodeURIComponent(planId)}/subscribers/${encodeURIComponent(userId)}/progress`,
    { method: "GET", headers: HEADERS() }
  );
  return parseApiResponse<UserTrainingPlanDto>(res, "adminGetSubscriberProgress");
}

// ── Professional — Gestão ─────────────────────────────────────────────────────

export async function profGetManagedPlans(): Promise<ApiResponse<TrainingPlanDto[]>> {
  const res = await fetch(`${BASE}/managed`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<TrainingPlanDto[]>(res, "profGetManagedPlans");
}

export async function profGetManagedPlan(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/managed/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<TrainingPlanDto>(res, "profGetManagedPlan");
}

export async function profCreateManagedPlan(
  payload: CreateTrainingPlanPayload
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/managed`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<TrainingPlanDto>(res, "profCreateManagedPlan");
}

export async function profUpdateManagedPlan(
  id: string,
  payload: UpdateTrainingPlanPayload
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(`${BASE}/managed/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<TrainingPlanDto>(res, "profUpdateManagedPlan");
}

export async function profActivateManagedPlan(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/managed/${encodeURIComponent(id)}/activate`,
    { method: "PATCH", headers: HEADERS() }
  );
  return parseApiResponse<TrainingPlanDto>(res, "profActivateManagedPlan");
}

export async function profDeactivateManagedPlan(
  id: string
): Promise<ApiResponse<TrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/managed/${encodeURIComponent(id)}/deactivate`,
    { method: "PATCH", headers: HEADERS() }
  );
  return parseApiResponse<TrainingPlanDto>(res, "profDeactivateManagedPlan");
}

export async function profGetManagedPlanSubscribers(
  id: string
): Promise<ApiResponse<TrainingPlanSubscriberDto[]>> {
  const res = await fetch(
    `${BASE}/managed/${encodeURIComponent(id)}/subscribers`,
    { method: "GET", headers: HEADERS() }
  );
  return parseApiResponse<TrainingPlanSubscriberDto[]>(res, "profGetManagedPlanSubscribers");
}

export async function profGetManagedSubscriberProgress(
  planId: string,
  subscriberUserId: string
): Promise<ApiResponse<UserTrainingPlanDto>> {
  const res = await fetch(
    `${BASE}/managed/${encodeURIComponent(planId)}/subscribers/${encodeURIComponent(subscriberUserId)}/progress`,
    { method: "GET", headers: HEADERS() }
  );
  return parseApiResponse<UserTrainingPlanDto>(res, "profGetManagedSubscriberProgress");
}
