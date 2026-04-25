// 🌐 Em produção (publicado), usa a Edge Function do Lovable Cloud como proxy
// para evitar erro de mixed content (HTTPS -> HTTP) e CORS.
// Em dev (vite), usa o proxy do vite.config.ts via path relativo.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const IS_DEV = import.meta.env.DEV;

const API_BASE_URL = "";

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

// 🔥 Helper genérico para processar respostas da API
async function parseApiResponse<T>(
  response: Response,
  context: string
): Promise<ApiResponse<T>> {
  const text = await response.text();
  console.log(`📥 [${context}] Status:`, response.status);
  console.log(`📥 [${context}] Status Text:`, response.statusText);
  console.log(`📥 [${context}] Headers:`, Object.fromEntries(response.headers.entries()));
  console.log(`📥 [${context}] Response object:`, response);
  console.log(`📥 [${context}] RAW response text:`, text);

  let parsed: ApiResponse<T> | null = null;

  if (text) {
    try {
      parsed = JSON.parse(text) as ApiResponse<T>;
      console.log(`✅ [${context}] Parsed response object:`, parsed);
      console.log(`✅ [${context}] Parsed response (JSON):`, JSON.stringify(parsed, null, 2));
    } catch (err) {
      console.error(`❌ [${context}] Resposta não é JSON válido:`, err);
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

  console.log("📤 Login request payload:", payload);

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
  console.log("📤 Register payload:", data);

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
