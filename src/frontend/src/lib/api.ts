// 🌐 Em produção (publicado), usa a Edge Function do Lovable Cloud como proxy
// para evitar erro de mixed content (HTTPS -> HTTP) e CORS.
// Em dev (vite), usa o proxy do vite.config.ts via path relativo.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const IS_DEV = import.meta.env.DEV;

const API_BASE_URL = import.meta.env.API_URL;

// 🔥 Wrapper genérico de resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface RegisterRequest {
  firstname: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegisterResponse = ApiResponse<unknown>;

export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = ApiResponse<unknown>;

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export type ResetPasswordResponse = ApiResponse<unknown>;

export interface ProfileData {
  id: string;
  firstname: string;
  surname: string;
  email: string;
}

export type ProfileResponse = ApiResponse<ProfileData>;

export interface UpdateProfileRequest {
  firstname: string;
  surname: string;
  email: string;
}

export type UpdateProfileResponse = ApiResponse<ProfileData>;

/**
 * Monta o header de autenticação para a API DailyFitness.
 *
 * Em produção, as chamadas passam pela Edge Function (proxy). O header
 * `Authorization` nesse caminho é consumido pela infra do Supabase para
 * validar a invocação da função, então enviamos o JWT da API alvo em
 * `X-Api-Authorization`, e o proxy o reescreve como `Authorization`
 * antes de chamar a API real.
 * Em dev (proxy do Vite), enviamos diretamente como `Authorization`.
 */
function getAuthHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;
  if (!token) return {};
  const bearer = `Bearer ${token}`;
  return { Authorization: bearer };
}

// 🔥 Helper genérico para processar respostas da API
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
      // Resposta não é JSON válido — tratado abaixo
    }
  }

  // ❌ erro HTTP
  if (!response.ok) {
    throw new Error(
      parsed?.message || `Erro em ${context}. Código: ${response.status}`
    );
  }

  // ❌ resposta inválida (sem JSON)
  if (!parsed) {
    throw new Error(`Resposta da API (${context}) não é JSON válido`);
  }

  // 🔥 Normaliza o envelope para garantir o formato esperado
  return {
    success: Boolean(parsed.success),
    message: parsed.message ?? "",
    data: parsed.data ?? null,
  };
}

// 🔥 LOGIN
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const payload = { email: data.email, password: data.password };

  const response = await fetch(`${API_BASE_URL}/DailyFitness/Users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await parseApiResponse<LoginData>(response, "login");

  // ❌ falha lógica
  if (!result.success) {
    throw new Error(result.message || "Falha no login");
  }

  // ❌ token não veio (data pode ser null em respostas genéricas)
  if (!result.data?.token) {
    throw new Error("Token não encontrado na resposta");
  }

  return result;
}

// 🔥 REGISTER
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/DailyFitness/Users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await parseApiResponse<unknown>(response, "register");

  // ❌ falha lógica
  if (!result.success) {
    throw new Error(result.message || "Falha no cadastro");
  }

  return result;
}

// 🔥 FORGOT PASSWORD - solicita email com token de reset
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response = await fetch(
    `${API_BASE_URL}/DailyFitness/Users/forgot-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await parseApiResponse<unknown>(response, "forgot-password");

  if (!result.success) {
    throw new Error(result.message || "Falha ao solicitar recuperação de senha");
  }

  return result;
}

// 🔥 RESET PASSWORD - redefine a senha com token recebido
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await fetch(
    `${API_BASE_URL}/DailyFitness/Users/reset-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await parseApiResponse<unknown>(response, "reset-password");

  if (!result.success) {
    throw new Error(result.message || "Falha ao redefinir a senha");
  }

  return result;
}

// 🔥 GET PROFILE - retorna informações do perfil autenticado
export async function getProfile(userId: string): Promise<ProfileResponse> {
  const response = await fetch(
    `${API_BASE_URL}/DailyFitness/Users/get-profile/${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    }
  );

  const result = await parseApiResponse<ProfileData>(response, "get-profile");

  if (!result.success) {
    throw new Error(result.message || "Falha ao carregar perfil");
  }

  return result;
}

// 🔥 UPDATE PROFILE - atualiza informações do usuário autenticado
export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  const response = await fetch(
    `${API_BASE_URL}/DailyFitness/Users/update-profile/${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    }
  );

  const result = await parseApiResponse<ProfileData>(response, "update-profile");

  if (!result.success) {
    throw new Error(result.message || "Falha ao atualizar perfil");
  }

  return result;
}
