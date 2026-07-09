export interface Env {
  // Add bindings here later if you need them (KV, env vars, etc.)
}

const CONTACT_DISCORD = "doughmination";
const CONTACT_DISCORD_ID = "1464890289922641993";
const CONTACT_EMAIL = "admin@doughmination.win";

function errorPage(status: number): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Site temporarily unavailable</title>
    <style>
      /* Catppuccin Mocha, pink accent */
      body {
        font-family: "Comic Sans MS", "Comic Sans", cursive, sans-serif;
        background: #1e1e2e; /* base */
        color: #cdd6f4; /* text */
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        margin: 0;
        text-align: center;
        padding: 2rem;
      }
      .card {
        max-width: 420px;
        background: #181825; /* mantle */
        border: 1px solid #313244; /* surface0 */
        border-radius: 12px;
        padding: 2.5rem 2rem;
      }
      h1 { font-size: 1.4rem; margin-bottom: 0.5rem; color: #f5c2e7; } /* pink */
      p { line-height: 1.5; color: #bac2de; } /* subtext1 */
      .contact { margin-top: 1.5rem; font-size: 0.95rem; }
      .contact a, .contact button {
        color: #f5c2e7; /* pink */
        text-decoration: none;
        font-weight: 600;
        border-bottom: 1px solid rgba(245, 194, 231, 0.4);
        transition: border-color 0.15s ease;
      }
      .contact button {
        font-family: inherit;
        font-size: inherit;
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
        cursor: pointer;
        padding: 0;
      }
      .contact a:hover, .contact button:hover { border-color: #f5c2e7; }
      .sep { color: #6c7086; margin: 0 0.35rem; }
      .copied { color: #a6e3a1; font-size: 0.8rem; margin-left: 0.5rem; opacity: 0; transition: opacity 0.15s ease; }
      .copied.show { opacity: 1; }
      .code { color: #6c7086; font-size: 0.8rem; margin-top: 2rem; } /* overlay0 */
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page isn't loading right now</h1>
      <p>If this page isn't loading, try again in a few minutes.</p>
      <p>The dedicated server may be restarting.</p>
      <p class="contact">
        Still broken? Contact the owner:<br />
        Discord:
        <a href="https://discord.com/users/${CONTACT_DISCORD_ID}" target="_blank" rel="noopener noreferrer">open profile</a>
        <span class="sep">·</span>
        <button type="button" id="discord-copy">copy username</button>
        <span class="copied" id="discord-copied">copied!</span>
        <br />
        Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      </p>
      <p class="code">Error ${status}</p>
    </div>
    <script>
      document.getElementById("discord-copy").addEventListener("click", function () {
        navigator.clipboard.writeText("${CONTACT_DISCORD}").then(function () {
          var el = document.getElementById("discord-copied");
          el.classList.add("show");
          setTimeout(function () { el.classList.remove("show"); }, 1500);
        });
      });
    </script>
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