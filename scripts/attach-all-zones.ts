/**
 * Attach the cf-error-worker to EVERY zone in the Cloudflare account.
 *
 * Cloudflare has no single "all zones" route, so this script:
 *   1. lists every zone in the account, then
 *   2. creates a `<zone>/*` worker route in each one.
 *
 * It is idempotent — re-running it skips zones that already have the route,
 * so it's also how you cover any new domain you add later.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=xxxx bun run routes
 *
 * The API token needs these permissions:
 *   - Zone → Zone → Read
 *   - Zone → Workers Routes → Edit
 */

const ACCOUNT_ID = "f87ee4b9600f437b8da1104d077418c3";
const SCRIPT_NAME = "cf-error-worker"; // must match "name" in wrangler.jsonc
const API = "https://api.cloudflare.com/client/v4";

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("Missing CLOUDFLARE_API_TOKEN environment variable.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

interface Zone {
  id: string;
  name: string;
}

interface CfResult<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
  result_info?: { page: number; total_pages: number };
}

async function cf<T>(path: string, init?: RequestInit): Promise<CfResult<T>> {
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const body = (await res.json()) as CfResult<T>;
  if (!body.success) {
    const msg = body.errors?.map((e) => `${e.code}: ${e.message}`).join("; ");
    throw new Error(`Cloudflare API error on ${path} — ${msg || res.status}`);
  }
  return body;
}

async function listZones(): Promise<Zone[]> {
  const zones: Zone[] = [];
  let page = 1;
  while (true) {
    const r = await cf<Zone[]>(
      `/zones?account.id=${ACCOUNT_ID}&per_page=50&page=${page}`,
    );
    zones.push(...r.result.map((z) => ({ id: z.id, name: z.name })));
    const info = r.result_info;
    if (!info || page >= info.total_pages) break;
    page++;
  }
  return zones;
}

interface Route {
  id: string;
  pattern: string;
  script?: string;
}

async function existingRoutes(zoneId: string): Promise<Route[]> {
  const r = await cf<Route[]>(`/zones/${zoneId}/workers/routes`);
  return r.result;
}

async function createRoute(zoneId: string, pattern: string): Promise<void> {
  await cf(`/zones/${zoneId}/workers/routes`, {
    method: "POST",
    body: JSON.stringify({ pattern, script: SCRIPT_NAME }),
  });
}

async function main() {
  const zones = await listZones();
  if (zones.length === 0) {
    console.log("No zones found for this account.");
    return;
  }

  console.log(`Found ${zones.length} zone(s). Attaching "${SCRIPT_NAME}"...\n`);

  for (const zone of zones) {
    const pattern = `${zone.name}/*`;
    const routes = await existingRoutes(zone.id);
    const already = routes.find(
      (r) => r.pattern === pattern && r.script === SCRIPT_NAME,
    );

    if (already) {
      console.log(`  ✓ ${zone.name} — already attached, skipping`);
      continue;
    }

    await createRoute(zone.id, pattern);
    console.log(`  + ${zone.name} — route ${pattern} created`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
