import type { UserRow } from "../types";

export async function getUserById(env: Env, id: string): Promise<UserRow | null> {
	return await env.DB.prepare(
		"SELECT id, firstName, lastName, email, createdAt, updatedAt, deletedAt FROM users WHERE id = ? AND deletedAt IS NULL",
	)
		.bind(id)
		.first<UserRow>();
}

export async function getUserIncludingDeleted(env: Env, id: string): Promise<UserRow | null> {
	return await env.DB.prepare(
		"SELECT id, firstName, lastName, email, createdAt, updatedAt, deletedAt FROM users WHERE id = ?",
	)
		.bind(id)
		.first<UserRow>();
}

export async function getAllUsers(env: Env): Promise<UserRow[]> {
	const stmt = env.DB.prepare(
		"SELECT id, firstName, lastName, email, createdAt, updatedAt, deletedAt FROM users WHERE deletedAt IS NULL ORDER BY createdAt DESC",
	);
	const { results } = await stmt.all<UserRow>();
	return results;
}

export async function createUser(
	env: Env,
	id: string,
	firstName: string,
	lastName: string,
	email: string,
): Promise<void> {
	await env.DB.prepare(
		"INSERT INTO users (id, firstName, lastName, email, createdAt, updatedAt, deletedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)",
	)
		.bind(id, firstName, lastName, email)
		.run();
}

export async function updateUser(
	env: Env,
	id: string,
	firstName: string,
	lastName: string,
	email: string,
): Promise<number> {
	const result = await env.DB.prepare(
		"UPDATE users SET firstName = ?, lastName = ?, email = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL",
	)
		.bind(firstName, lastName, email, id)
		.run();
	return result.meta.changes;
}

export async function softDeleteUser(env: Env, id: string): Promise<number> {
	const result = await env.DB.prepare(
		"UPDATE users SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL",
	)
		.bind(id)
		.run();
	return result.meta.changes;
}