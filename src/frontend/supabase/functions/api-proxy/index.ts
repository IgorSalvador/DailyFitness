// Edge Function: proxy HTTPS -> API DailyFitness
// Resolve mixed content e CORS em produção

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

// 🔒 Chamada via HTTPS para garantir tráfego criptografado.
// O servidor de origem possui certificado auto-assinado/inválido para o IP,
// então usamos um Deno.HttpClient com verificação de certificado desabilitada
// SOMENTE para este destino específico (não afeta outras chamadas).
const TARGET_BASE = "https://54.232.227.118";

// Cliente HTTP que aceita o certificado inválido apenas deste host.
// @ts-ignore - createHttpClient existe no runtime do Deno Deploy/Edge.
const insecureClient = (Deno as unknown as {
  createHttpClient?: (opts: { caCerts?: string[]; allowHost?: boolean }) => unknown;
}).createHttpClient?.({ caCerts: [] });

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const proxyPath = url.pathname.replace(/^.*\/api-proxy/, "");
    const targetUrl = `${TARGET_BASE}${proxyPath}${url.search}`;

    const init: RequestInit & { client?: unknown } = {
      method: req.method,
      headers: {
        "Content-Type":
          req.headers.get("content-type") ?? "application/json",
        Accept: "application/json",
      },
      redirect: "follow",
    };

    // Anexa o cliente inseguro se disponível (permite cert auto-assinado).
    if (insecureClient) {
      init.client = insecureClient;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.text();
    }

    const apiResponse = await fetch(targetUrl, init as RequestInit);
    const responseText = await apiResponse.text();

    return new Response(responseText, {
      status: apiResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          apiResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        message: `Proxy error: ${message}`,
        data: null,
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
