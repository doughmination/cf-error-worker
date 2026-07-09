export interface Env {
  // Add bindings here later if you need them (KV, env vars, etc.)
}

const CONTACT_DISCORD = "doughmination";
const CONTACT_EMAIL = "admin@doughmination.win";

function errorPage(status: number): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Site temporarily unavailable</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0f0f0f;
        color: #eaeaea;
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        margin: 0;
        text-align: center;
        padding: 2rem;
      }
      .card { max-width: 420px; }
      h1 { font-size: 1.4rem; margin-bottom: 0.5rem; }
      p { line-height: 1.5; color: #b5b5b5; }
      .contact { margin-top: 1.5rem; font-size: 0.95rem; }
      .contact b { color: #eaeaea; }
      .code { color: #666; font-size: 0.8rem; margin-top: 2rem; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page isn't loading right now</h1>
      <p>If this page isn't loading, try again in a few minutes.</p>
      <p class="contact">
        Still broken? Contact the owner:<br />
        Discord: <b>${CONTACT_DISCORD}</b><br />
        Email: <b>${CONTACT_EMAIL}</b>
      </p>
      <p class="code">Error ${status}</p>
    </div>
  </body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(request);
    } catch {
      // Origin totally unreachable (connection refused, DNS failure inside your infra, etc.)
      return new Response(errorPage(521), {
        status: 521,
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }

    if (response.status >= 500 && response.status < 600) {
      return new Response(errorPage(response.status), {
        status: response.status,
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }

    return response;
  },
};