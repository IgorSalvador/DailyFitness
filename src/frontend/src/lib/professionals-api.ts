import { ApiResponse } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export interface ProfessionalDto {
  id: string;
  firstname: string;
  surname: string;
  email: string;
  biography: string;
  specialization: string;
  skills: string[];
}

export interface CreateProfessionalRequestPayload {
  userId: string;
  biography: string;
  specialization: string;
  skills: string[];
}

export enum EProfessionalRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export const ProfessionalRequestStatusLabel: Record<EProfessionalRequestStatus, string> = {
  [EProfessionalRequestStatus.Pending]: "Pendente",
  [EProfessionalRequestStatus.Approved]: "Aprovado",
  [EProfessionalRequestStatus.Rejected]: "Reprovado",
};

export interface ProfessionalRequestDto {
  id: string;
  userName: string;
  userEmail: string;
  biography: string;
  specialization: string;
  skills: string[];
  professionalRequestStatus: EProfessionalRequestStatus;
  evaluatedOn: string | null;
  evaluationComments: string | null;
  evaluatorFullName: string | null;
}

export interface EvaluateProfessionalRequestPayload {
  professionalRequestId: string;
  isApproved: boolean;
  comments?: string;
}

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
      parsed?.message || `Erro em ${context}. Codigo: ${response.status}`
    );
  }

  if (!parsed) {
    throw new Error(`Resposta da API (${context}) nao e JSON valido`);
  }

  return {
    success: Boolean(parsed.success),
    message: parsed.message ?? "",
    data: parsed.data ?? null,
  };
}

export async function getProfessionals(): Promise<ApiResponse<ProfessionalDto[]>> {
  const response = await fetch(`${API_BASE_URL}/Professionals`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  return parseApiResponse<ProfessionalDto[]>(response, "getProfessionals");
}

export async function getProfessionalById(
  id: string
): Promise<ApiResponse<ProfessionalDto>> {
  const response = await fetch(
    `${API_BASE_URL}/Professionals/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return parseApiResponse<ProfessionalDto>(response, "getProfessionalById");
}

export async function createProfessionalRequest(
  payload: CreateProfessionalRequestPayload
): Promise<ApiResponse<ProfessionalRequestDto>> {
  const response = await fetch(
    `${API_BASE_URL}/Professionals/create-request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(payload),
    }
  );
  return parseApiResponse<ProfessionalRequestDto>(response, "createProfessionalRequest");
}

export async function getAllProfessionalRequests(): Promise<
  ApiResponse<ProfessionalRequestDto[]>
> {
  const response = await fetch(
    `${API_BASE_URL}/Professionals/get-requests`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return parseApiResponse<ProfessionalRequestDto[]>(response, "getAllProfessionalRequests");
}

export async function getProfessionalRequestById(
  id: string
): Promise<ApiResponse<ProfessionalRequestDto>> {
  const response = await fetch(
    `${API_BASE_URL}/Professionals/get-requests/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return parseApiResponse<ProfessionalRequestDto>(response, "getProfessionalRequestById");
}

export async function evaluateProfessionalRequest(
  payload: EvaluateProfessionalRequestPayload
): Promise<ApiResponse<ProfessionalRequestDto>> {
  const response = await fetch(
    `${API_BASE_URL}/Professionals/evaluate-request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(payload),
    }
  );
  return parseApiResponse<ProfessionalRequestDto>(response, "evaluateProfessionalRequest");
}
