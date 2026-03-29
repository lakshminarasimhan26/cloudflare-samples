import { Hono } from "hono";
import { coerceCreateUserInput, isUniqueEmailError } from "../utils";
import {
	getAllUsers,
	getUserById,
	getUserIncludingDeleted,
	createUser,
	updateUser,
	softDeleteUser,
} from "../db/users";

const users = new Hono<{ Bindings: Env }>();

// GET /users — list all active users
users.get("/", async (c) => {
	const results = await getAllUsers(c.env);
	return c.json({ users: results });
});

// POST /users — create a new user
users.post("/", async (c) => {
	let payload: unknown;
	try {
		payload = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body" }, 400);
	}

	const input = coerceCreateUserInput(payload);
	if (!input) {
		return c.json({ error: "Body must include firstName, lastName, and email" }, 400);
	}

	const id = crypto.randomUUID();

	try {
		await createUser(c.env, id, input.firstName, input.lastName, input.email);
	} catch (err) {
		if (isUniqueEmailError(err)) {
			return c.json({ error: "Email already exists" }, 409);
		}
		return c.json({ error: "Failed to create user" }, 500);
	}

	const created = await getUserById(c.env, id);
	if (!created) return c.json({ error: "User not found after creation" }, 404);
	return c.json(created, 201);
});

// GET /users/:id — get a single user
users.get("/:id", async (c) => {
	const user = await getUserById(c.env, c.req.param("id"));
	if (!user) return c.json({ error: "Not Found" }, 404);
	return c.json(user);
});

// PUT /users/:id — update a user
users.put("/:id", async (c) => {
	let payload: unknown;
	try {
		payload = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body" }, 400);
	}

	const input = coerceCreateUserInput(payload);
	if (!input) {
		return c.json({ error: "Body must include firstName, lastName, and email" }, 400);
	}

	const id = c.req.param("id");

	try {
		const changes = await updateUser(c.env, id, input.firstName, input.lastName, input.email);
		if (changes === 0) return c.json({ error: "User not found" }, 404);
	} catch (err) {
		if (isUniqueEmailError(err)) {
			return c.json({ error: "Email already exists" }, 409);
		}
		return c.json({ error: "Failed to update user" }, 500);
	}

	const updated = await getUserById(c.env, id);
	if (!updated) return c.json({ error: "User not found" }, 404);
	return c.json(updated);
});

// DELETE /users/:id — soft-delete a user
users.delete("/:id", async (c) => {
	const id = c.req.param("id");

	try {
		const changes = await softDeleteUser(c.env, id);
		if (changes === 0) return c.json({ error: "User not found" }, 404);
	} catch {
		return c.json({ error: "Failed to delete user" }, 500);
	}

	const deleted = await getUserIncludingDeleted(c.env, id);
	if (!deleted) return c.json({ error: "User not found" }, 404);
	return c.json(deleted);
});

export default users;