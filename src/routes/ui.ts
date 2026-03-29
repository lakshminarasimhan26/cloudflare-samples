import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

// Pages
import { usersListPage }              from "../ui/pages/users-list";
import { createUserPage }             from "../ui/pages/create-user";
import { editUserPage }               from "../ui/pages/edit-user";
import { notificationsDashboardPage } from "../ui/pages/notifications-dashboard";
import { userNotificationsPage }      from "../ui/pages/user-notifications";

// Utils
import { coerceCreateUserInput, isUniqueEmailError } from "../utils";

// DB
import {
	getAllUsers, getUserById, createUser, updateUser,
	softDeleteUser, getUserIncludingDeleted,
} from "../db/users";
import {
	getAllNotifications, getNotificationsByUserId,
	markNotificationRead, markAllReadForUser, deleteNotification,
} from "../db/notifications";

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
		firstName: form.get("firstName"),
		lastName:  form.get("lastName"),
		email:     form.get("email"),
	});
	if (!input) return c.html(createUserPage("Please fill in all fields correctly."), 400);

	const id = crypto.randomUUID();
	try {
		await createUser(c.env, id, input.firstName, input.lastName, input.email);
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
		firstName: form.get("firstName"),
		lastName:  form.get("lastName"),
		email:     form.get("email"),
	});

	if (!input) {
		const user = await getUserById(c.env, id);
		if (!user) return c.html("<h1>User not found</h1>", 404);
		return c.html(editUserPage(user, "Please fill in all fields correctly."), 400);
	}

	try {
		const changes = await updateUser(c.env, id, input.firstName, input.lastName, input.email);
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

// Mark one read — supports optional _redirect field for post-action destination
ui.post("/notifications/:id/read", async (c) => {
	const id   = c.req.param("id");
	const form = await c.req.formData();
	await markNotificationRead(c.env, id);
	setFlash(c, "success", "Notification marked as read.");
	const redirect = (form.get("_redirect") as string) || "/ui/notifications";
	return c.redirect(redirect);
});

// Delete one notification
ui.post("/notifications/:id/delete", async (c) => {
	const id   = c.req.param("id");
	const form = await c.req.formData();
	await deleteNotification(c.env, id);
	setFlash(c, "success", "Notification deleted.");
	const redirect = (form.get("_redirect") as string) || "/ui/notifications";
	return c.redirect(redirect);
});

export default ui;
