import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { usersListPage } from "../ui/pages/users-list";
import { createUserPage } from "../ui/pages/create-user";
import { editUserPage } from "../ui/pages/edit-user";
import { coerceCreateUserInput, isUniqueEmailError } from "../utils";
import {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	softDeleteUser,
	getUserIncludingDeleted,
} from "../db/users";

const ui = new Hono<{ Bindings: Env }>();

// Flash message helpers (stored in a short-lived cookie)
function setFlash(c: any, type: "success" | "error", message: string) {
	setCookie(c, "flash", JSON.stringify({ type, message }), { path: "/", maxAge: 5 });
}
function getFlash(c: any): { type: "success" | "error"; message: string } | undefined {
	const raw = getCookie(c, "flash");
	if (!raw) return undefined;
	deleteCookie(c, "flash", { path: "/" });
	try { return JSON.parse(raw); } catch { return undefined; }
}

// ── GET /ui/users ─────────────────────────────────────────────
ui.get("/users", async (c) => {
	const users = await getAllUsers(c.env);
	const flash = getFlash(c);
	return c.html(usersListPage(users, flash));
});

// ── GET /ui/users/new ─────────────────────────────────────────
ui.get("/users/new", (c) => c.html(createUserPage()));

// ── POST /ui/users/new ────────────────────────────────────────
ui.post("/users/new", async (c) => {
	const form = await c.req.formData();
	const payload = {
		firstName: form.get("firstName"),
		lastName:  form.get("lastName"),
		email:     form.get("email"),
	};

	const input = coerceCreateUserInput(payload);
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

// ── GET /ui/users/:id/edit ────────────────────────────────────
ui.get("/users/:id/edit", async (c) => {
	const user = await getUserById(c.env, c.req.param("id"));
	if (!user) return c.html("<h1>User not found</h1>", 404);
	return c.html(editUserPage(user));
});

// ── POST /ui/users/:id/edit ───────────────────────────────────
ui.post("/users/:id/edit", async (c) => {
	const id   = c.req.param("id");
	const form = await c.req.formData();
	const payload = {
		firstName: form.get("firstName"),
		lastName:  form.get("lastName"),
		email:     form.get("email"),
	};

	const input = coerceCreateUserInput(payload);
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

// ── POST /ui/users/:id/delete ─────────────────────────────────
ui.post("/users/:id/delete", async (c) => {
	const id = c.req.param("id");

	// Fetch before deleting so we have the name for the flash message
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

export default ui;