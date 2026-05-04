import { ApiResponse } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ── Enums ──────────────────────────────────────────────────────────────────────

export enum EChallengeType {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

export enum EChallengeStatus {
  Active = 1,
  Closed = 2,
  Discontinued = 3,
}

export enum EUserChallengeStatus {
  Active = 1,
  Completed = 2,
  Abandoned = 3,
  Discontinued = 4,
  Expired = 5,
}

// ── Labels para exibição ───────────────────────────────────────────────────────

export const ChallengeTypeLabel: Record<EChallengeType, string> = {
  [EChallengeType.Daily]: "Diário",
  [EChallengeType.Weekly]: "Semanal",
  [EChallengeType.Monthly]: "Mensal",
};

export const ChallengeStatusLabel: Record<EChallengeStatus, string> = {
  [EChallengeStatus.Active]: "Ativo",
  [EChallengeStatus.Closed]: "Encerrado",
  [EChallengeStatus.Discontinued]: "Descontinuado",
};

export const UserChallengeStatusLabel: Record<EUserChallengeStatus, string> = {
  [EUserChallengeStatus.Active]: "Ativo",
  [EUserChallengeStatus.Completed]: "Concluído",
  [EUserChallengeStatus.Abandoned]: "Abandonado",
  [EUserChallengeStatus.Discontinued]: "Descontinuado",
  [EUserChallengeStatus.Expired]: "Expirado",
};

// ── DTOs de Response ───────────────────────────────────────────────────────────

export interface ChallengeDto {
  id: string;
  name: string;
  description: string;
  type: EChallengeType;
  challengeStatus: EChallengeStatus;
  status: number; // EntityStatus: 0=Inactive, 1=Active
  expectedEndDate: string; // ISO 8601
  isExpired: boolean;
  participantCount: number;
  activeParticipantCount: number;
  createdById: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserChallengeProgressDto {
  id: string;
  userChallengeId: string;
  referenceDate: string;
  referencePeriod: string;
  progressValue: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserChallengeDto {
  id: string;
  userId: string;
  userFullName: string;
  challengeId: string;
  challengeName: string;
  challengeType: EChallengeType;
  challengeStatus: EChallengeStatus;
  challengeExpectedEndDate: string;
  userChallengeStatus: EUserChallengeStatus;
  joinedAt: string;
  leftAt: string | null;
  completedAt: string | null;
  discontinuedAt: string | null;
  currentProgress: number;
  targetProgress: number;
  lastProgressUpdateAt: string | null;
  progresses: UserChallengeProgressDto[];
  createdAt: string;
  updatedAt: string | null;
}

// ── DTOs de Request ────────────────────────────────────────────────────────────

export interface CreateChallengePayload {
  name: string;
  description: string;
  type: EChallengeType;
  expectedEndDate: string; // ISO 8601
}

export interface UpdateChallengePayload {
  name: string;
  description: string;
  expectedEndDate: string; // ISO 8601
  type?: EChallengeType;
  challengeStatus?: EChallengeStatus;
}

export interface UpdateProgressPayload {
  progressValue: number;
  notes?: string;
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

const BASE = `${API_BASE_URL}/Challenges`;
const HEADERS = () => ({ "Content-Type": "application/json", ...getAuthHeader() });

// ── Admin ──────────────────────────────────────────────────────────────────────

export async function getChallenges(): Promise<ApiResponse<ChallengeDto[]>> {
  const response = await fetch(BASE, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<ChallengeDto[]>(response, "getChallenges");
}

export async function getChallengeById(
  id: string
): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<ChallengeDto>(response, "getChallengeById");
}

export async function createChallenge(
  payload: CreateChallengePayload
): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(BASE, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ChallengeDto>(response, "createChallenge");
}

export async function updateChallenge(
  id: string,
  payload: UpdateChallengePayload
): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ChallengeDto>(response, "updateChallenge");
}

export async function discontinueChallenge(
  id: string
): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(id)}/discontinue`,
    {
      method: "PATCH",
      headers: HEADERS(),
    }
  );
  return parseApiResponse<ChallengeDto>(response, "discontinueChallenge");
}

export async function getChallengeParticipants(
  id: string
): Promise<ApiResponse<UserChallengeDto[]>> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(id)}/participants`,
    {
      method: "GET",
      headers: HEADERS(),
    }
  );
  return parseApiResponse<UserChallengeDto[]>(response, "getChallengeParticipants");
}

// ── User ───────────────────────────────────────────────────────────────────────

export async function getAvailableChallenges(): Promise<
  ApiResponse<ChallengeDto[]>
> {
  const response = await fetch(`${BASE}/available`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<ChallengeDto[]>(response, "getAvailableChallenges");
}

export async function joinChallenge(
  id: string
): Promise<ApiResponse<UserChallengeDto>> {
  const response = await fetch(`${BASE}/${encodeURIComponent(id)}/join`, {
    method: "POST",
    headers: HEADERS(),
  });
  return parseApiResponse<UserChallengeDto>(response, "joinChallenge");
}

export async function getMyChallenges(): Promise<
  ApiResponse<UserChallengeDto[]>
> {
  const response = await fetch(`${BASE}/my`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<UserChallengeDto[]>(response, "getMyChallenges");
}

export async function getMyChallengeDetails(
  userChallengeId: string
): Promise<ApiResponse<UserChallengeDto>> {
  const response = await fetch(
    `${BASE}/my/${encodeURIComponent(userChallengeId)}`,
    {
      method: "GET",
      headers: HEADERS(),
    }
  );
  return parseApiResponse<UserChallengeDto>(response, "getMyChallengeDetails");
}

export async function updateProgress(
  userChallengeId: string,
  payload: UpdateProgressPayload
): Promise<ApiResponse<UserChallengeDto>> {
  const response = await fetch(
    `${BASE}/my/${encodeURIComponent(userChallengeId)}/progress`,
    {
      method: "PUT",
      headers: HEADERS(),
      body: JSON.stringify(payload),
    }
  );
  return parseApiResponse<UserChallengeDto>(response, "updateProgress");
}

export async function leaveChallenge(
  userChallengeId: string
): Promise<ApiResponse<UserChallengeDto>> {
  const response = await fetch(
    `${BASE}/my/${encodeURIComponent(userChallengeId)}/leave`,
    {
      method: "PATCH",
      headers: HEADERS(),
    }
  );
  return parseApiResponse<UserChallengeDto>(response, "leaveChallenge");
}

// ── Professional ───────────────────────────────────────────────────────────────

export async function getManagedChallenges(): Promise<ApiResponse<ChallengeDto[]>> {
  const response = await fetch(`${BASE}/managed`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<ChallengeDto[]>(response, "getManagedChallenges");
}

export async function getManagedChallengeById(id: string): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(`${BASE}/managed/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: HEADERS(),
  });
  return parseApiResponse<ChallengeDto>(response, "getManagedChallengeById");
}

export async function createManagedChallenge(
  payload: CreateChallengePayload
): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(`${BASE}/managed`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ChallengeDto>(response, "createManagedChallenge");
}

export async function updateManagedChallenge(
  id: string,
  payload: UpdateChallengePayload
): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(`${BASE}/managed/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: HEADERS(),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ChallengeDto>(response, "updateManagedChallenge");
}

export async function discontinueManagedChallenge(id: string): Promise<ApiResponse<ChallengeDto>> {
  const response = await fetch(`${BASE}/managed/${encodeURIComponent(id)}/discontinue`, {
    method: "PATCH",
    headers: HEADERS(),
  });
  return parseApiResponse<ChallengeDto>(response, "discontinueManagedChallenge");
}
