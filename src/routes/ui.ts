import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

// Pages
import { usersListPage }              from "../ui/pages/users-list";
import { createUserPage }             from "../ui/pages/create-user";
import { editUserPage }               from "../ui/pages/edit-user";
import { notificationsDashboardPage } from "../ui/pages/notifications-dashboard";
import { userNotificationsPage }      from "../ui/pages/user-notifications";
import { importLogPage }              from "../ui/pages/import-log";

// Utils
import { coerceCreateUserInput, isUniqueEmailError } from "../utils";

// DB
import {
	getAllUsers, getUserById, createUser, updateUser, softDeleteUser,
} from "../db/users";
import {
	getAllNotifications, getNotificationsByUserId,
	markNotificationRead, markAllReadForUser, deleteNotification,
} from "../db/notifications";
import { getImportLog } from "../db/importLog";

// Services
import { runR2Import } from "../services/r2Importer";

const ui = new Hono<{ Bindings: Env }>();

// ── Flash helpers ─────────────────────────────────────────────
type Flash = { type: "success" | "error"; message: string };

function setFlash(c: any, type: Flash["type"], message: string) {
	setCookie(c, "flash", JSON.stringify({ type, message }), { path: "/", maxAge: 5 });
}
function getFlash(c: any): Flash | undefined {
	const raw = getCookie(c, "flash");
	if (!raw) return undefined;
	deleteCookie(c, "flash", { path: "/" });
	try { return JSON.parse(raw); } catch { return undefined; }
}

// ════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════

ui.get("/users", async (c) => {
	const users = await getAllUsers(c.env);
	return c.html(usersListPage(users, getFlash(c)));
});

ui.get("/users/new", (c) => c.html(createUserPage()));

ui.post("/users/new", async (c) => {
	const form  = await c.req.formData();
	const input = coerceCreateUserInput({
		firstName:   form.get("firstName"),
		lastName:    form.get("lastName"),
		email:       form.get("email"),
		dateOfBirth: form.get("dateOfBirth"),
	});
	if (!input) return c.html(createUserPage("Please fill in all required fields correctly."), 400);

	const id = crypto.randomUUID();
	try {
		await createUser(c.env, id, input.firstName, input.lastName, input.email, input.dateOfBirth ?? null);
	} catch (err) {
		const msg = isUniqueEmailError(err) ? "That email is already in use." : "Failed to create user.";
		return c.html(createUserPage(msg), 409);
	}

	setFlash(c, "success", `${input.firstName} ${input.lastName} was created successfully.`);
	return c.redirect("/ui/users");
});

ui.get("/users/:id/edit", async (c) => {
	const user = await getUserById(c.env, c.req.param("id"));
	if (!user) return c.html("<h1>User not found</h1>", 404);
	return c.html(editUserPage(user));
});

ui.post("/users/:id/edit", async (c) => {
	const id   = c.req.param("id");
	const form = await c.req.formData();
	const input = coerceCreateUserInput({
		firstName:   form.get("firstName"),
		lastName:    form.get("lastName"),
		email:       form.get("email"),
		dateOfBirth: form.get("dateOfBirth"),
	});

	if (!input) {
		const user = await getUserById(c.env, id);
		if (!user) return c.html("<h1>User not found</h1>", 404);
		return c.html(editUserPage(user, "Please fill in all required fields correctly."), 400);
	}

	try {
		const changes = await updateUser(c.env, id, input.firstName, input.lastName, input.email, input.dateOfBirth ?? null);
		if (changes === 0) return c.html("<h1>User not found</h1>", 404);
	} catch (err) {
		const user = await getUserById(c.env, id);
		if (!user) return c.html("<h1>User not found</h1>", 404);
		const msg = isUniqueEmailError(err) ? "That email is already in use." : "Failed to update user.";
		return c.html(editUserPage(user, msg), 409);
	}

	setFlash(c, "success", `${input.firstName} ${input.lastName} was updated successfully.`);
	return c.redirect("/ui/users");
});

ui.post("/users/:id/delete", async (c) => {
	const id   = c.req.param("id");
	const user = await getUserById(c.env, id);
	if (!user) return c.html("<h1>User not found</h1>", 404);

	try {
		const changes = await softDeleteUser(c.env, id);
		if (changes === 0) return c.html("<h1>User not found</h1>", 404);
	} catch {
		return c.html(editUserPage(user, "Failed to delete user."), 500);
	}

	setFlash(c, "success", `${user.firstName} ${user.lastName} was deleted.`);
	return c.redirect("/ui/users");
});

// ── Per-user notifications ────────────────────────────────────

ui.get("/users/:id/notifications", async (c) => {
	const user = await getUserById(c.env, c.req.param("id"));
	if (!user) return c.html("<h1>User not found</h1>", 404);
	const notifs = await getNotificationsByUserId(c.env, user.id);
	return c.html(userNotificationsPage(user, notifs, getFlash(c)));
});

ui.post("/users/:id/notifications/read-all", async (c) => {
	const id   = c.req.param("id");
	const user = await getUserById(c.env, id);
	if (!user) return c.html("<h1>User not found</h1>", 404);
	await markAllReadForUser(c.env, id);
	setFlash(c, "success", "All notifications marked as read.");
	return c.redirect(`/ui/users/${id}/notifications`);
});

// ════════════════════════════════════════════════════════════════
// NOTIFICATIONS DASHBOARD
// ════════════════════════════════════════════════════════════════

ui.get("/notifications", async (c) => {
	const notifs = await getAllNotifications(c.env);
	return c.html(notificationsDashboardPage(notifs, getFlash(c)));
});

ui.post("/notifications/:id/read", async (c) => {
	const id   = c.req.param("id");
	const form = await c.req.formData();
	await markNotificationRead(c.env, id);
	setFlash(c, "success", "Notification marked as read.");
	const redirect = (form.get("_redirect") as string) || "/ui/notifications";
	return c.redirect(redirect);
});

ui.post("/notifications/:id/delete", async (c) => {
	const id   = c.req.param("id");
	const form = await c.req.formData();
	await deleteNotification(c.env, id);
	setFlash(c, "success", "Notification deleted.");
	const redirect = (form.get("_redirect") as string) || "/ui/notifications";
	return c.redirect(redirect);
});

// ════════════════════════════════════════════════════════════════
// R2 IMPORT LOG
// ════════════════════════════════════════════════════════════════

ui.get("/import", async (c) => {
	const logs = await getImportLog(c.env);
	return c.html(importLogPage(logs, getFlash(c)));
});

// ── Debug endpoint: shows exactly what the importer sees ─────
// Visit GET /ui/import/debug in your browser to diagnose issues.
// Remove this route before deploying to production.
ui.get("/import/debug", async (c) => {
	const lines: string[] = [];

	// 1. Check R2 binding exists
	lines.push("=== R2 Binding ===");
	if (!c.env.USER_IMPORTS_BUCKET) {
		lines.push("❌ USER_IMPORTS_BUCKET is undefined — run: npm run cf-typegen");
	} else {
		lines.push("✅ USER_IMPORTS_BUCKET binding is present");
	}

	// 2. List all objects in bucket
	lines.push("\n=== R2 Bucket Contents ===");
	try {
		const listed = await c.env.USER_IMPORTS_BUCKET.list();
		if (listed.objects.length === 0) {
			lines.push("❌ Bucket is EMPTY — upload a file first:");
			lines.push("   npx wrangler r2 object put user-imports/batch-001.json --file=r2-samples/batch-001.json --local");
		} else {
			lines.push(`✅ Found ${listed.objects.length} object(s):`);
			for (const obj of listed.objects) {
				lines.push(`   • ${obj.key} (${obj.size} bytes)`);
			}
		}
	} catch (err) {
		lines.push(`❌ Failed to list bucket: ${err instanceof Error ? err.message : String(err)}`);
	}

	// 3. Check D1 tables
	lines.push("\n=== D1 Tables ===");
	try {
		const tables = await c.env.DB.prepare(
			"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
		).all<{ name: string }>();
		const names = tables.results.map(r => r.name);
		lines.push(`✅ Tables: ${names.join(", ")}`);

		const required = ["users", "notifications", "r2_import_log"];
		for (const t of required) {
			if (!names.includes(t)) {
				lines.push(`❌ Missing table: ${t} — run: npx wrangler d1 migrations apply my-first-worker --local`);
			}
		}
	} catch (err) {
		lines.push(`❌ DB query failed: ${err instanceof Error ? err.message : String(err)}`);
	}

	// 4. Check import log contents
	lines.push("\n=== r2_import_log rows ===");
	try {
		const log = await c.env.DB.prepare("SELECT * FROM r2_import_log ORDER BY importedAt DESC").all();
		if (log.results.length === 0) {
			lines.push("(empty — no imports recorded yet)");
		} else {
			for (const row of log.results) {
				lines.push(JSON.stringify(row));
			}
		}
	} catch (err) {
		lines.push(`❌ ${err instanceof Error ? err.message : String(err)}`);
	}

	// 5. Try a live dry-run against R2 to check key detection
	lines.push("\n=== JSON Key Detection ===");
	try {
		const listed = await c.env.USER_IMPORTS_BUCKET.list();
		const jsonKeys = listed.objects
			.filter((obj: any) => obj.key.endsWith(".json"))
			.map((obj: any) => obj.key);
		lines.push(`JSON files found: ${jsonKeys.length > 0 ? jsonKeys.join(", ") : "none"}`);
	} catch (err) {
		lines.push(`❌ ${err instanceof Error ? err.message : String(err)}`);
	}

	return c.text(lines.join("\n"));
});

// ── Manual trigger ────────────────────────────────────────────
ui.post("/import/trigger", async (c) => {
	try {
		const results = await runR2Import(c.env);
		if (results.length === 0) {
			setFlash(c, "success", "No new files found in the R2 bucket.");
		} else {
			const added   = results.reduce((s, r) => s + r.usersAdded,   0);
			const skipped = results.reduce((s, r) => s + r.usersSkipped, 0);
			const failed  = results.filter(r => r.status === "failed").length;
			const parts   = [`Processed ${results.length} file(s)`, `${added} added`, `${skipped} skipped`];
			if (failed > 0) parts.push(`${failed} failed`);
			setFlash(c, added > 0 || results.length > 0 ? "success" : "error", parts.join(" · "));
		}
	} catch (err) {
		// Surface the full error message in the flash so it appears in the UI
		const msg = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
		console.error("[Import trigger error]", msg);
		setFlash(c, "error", `Import error: ${err instanceof Error ? err.message : String(err)}`);
	}
	return c.redirect("/ui/import");
});

export default ui;
