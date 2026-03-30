import { Hono } from "hono";
import users         from "./routes/users";
import notifications from "./routes/notifications";
import ui            from "./routes/ui";
import { runR2Import } from "./services/r2Importer";

const app = new Hono<{ Bindings: Env }>();

// ── Misc ──────────────────────────────────────────────────────
app.get("/message", (c) => c.text("Hello, World to you all!"));
app.get("/random",  (c) => c.text(crypto.randomUUID()));

// ── REST API ──────────────────────────────────────────────────
app.route("/users",         users);
app.route("/notifications", notifications);

// ── UI Pages ──────────────────────────────────────────────────
app.route("/ui", ui);

// ── Root redirect ─────────────────────────────────────────────
app.get("/", (c) => c.redirect("/ui/users"));

// ── Cron handler — fires every hour (0 * * * *) ───────────────
// Cloudflare calls this via the `scheduled` export, not via HTTP.
export default {
	// Pass all HTTP requests through the Hono app
	fetch: app.fetch,

	// Cron trigger: import new JSON files from R2 into the users table
	async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(
			runR2Import(env).then((results) => {
				const added = results.reduce((s, r) => s + r.usersAdded, 0);
				console.log(
					`[R2 Import] Processed ${results.length} file(s), ${added} user(s) added.`,
					results,
				);
			}),
		);
	},
};
