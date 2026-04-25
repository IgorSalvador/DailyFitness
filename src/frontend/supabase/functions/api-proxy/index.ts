// Edge Function: proxy HTTPS -> HTTP para a API DailyFitness
// Resolve mixed content e CORS em produção

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

const TARGET_BASE = "http://54.232.227.118";

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Remove o prefixo /functions/v1/api-proxy do path
    const proxyPath = url.pathname.replace(
      /^\/functions\/v1\/api-proxy/,
      ""
    );
    const targetUrl = `${TARGET_BASE}${proxyPath}${url.search}`;

    console.log(`[proxy] ${req.method} -> ${targetUrl}`);

    // Repassa a request para a API real
    const init: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type":
          req.headers.get("content-type") ?? "application/json",
        Accept: "application/json",
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      init.body = body;
      console.log(`[proxy] body:`, body);
    }

    const apiResponse = await fetch(targetUrl, init);
    const responseText = await apiResponse.text();

    console.log(
      `[proxy] response status: ${apiResponse.status}, body: ${responseText}`
    );

    return new Response(responseText, {
      status: apiResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          apiResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    console.error("[proxy] error:", err);
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
