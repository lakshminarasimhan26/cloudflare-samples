import type { UserRow } from "../types";

const USER_COLS = "id, firstName, lastName, email, dateOfBirth, createdAt, updatedAt, deletedAt";

export async function getUserById(env: Env, id: string): Promise<UserRow | null> {
	return await env.DB.prepare(
		`SELECT ${USER_COLS} FROM users WHERE id = ? AND deletedAt IS NULL`
	).bind(id).first<UserRow>();
}

export async function getUserIncludingDeleted(env: Env, id: string): Promise<UserRow | null> {
	return await env.DB.prepare(
		`SELECT ${USER_COLS} FROM users WHERE id = ?`
	).bind(id).first<UserRow>();
}

export async function getUserByEmail(env: Env, email: string): Promise<UserRow | null> {
	return await env.DB.prepare(
		`SELECT ${USER_COLS} FROM users WHERE email = ? AND deletedAt IS NULL`
	).bind(email).first<UserRow>();
}

export async function getAllUsers(env: Env): Promise<UserRow[]> {
	const { results } = await env.DB.prepare(
		`SELECT ${USER_COLS} FROM users WHERE deletedAt IS NULL ORDER BY createdAt DESC`
	).all<UserRow>();
	return results;
}

export async function createUser(
	env: Env,
	id: string,
	firstName: string,
	lastName: string,
	email: string,
	dateOfBirth: string | null = null,
): Promise<void> {
	await env.DB.prepare(`
		INSERT INTO users (id, firstName, lastName, email, dateOfBirth, createdAt, updatedAt, deletedAt)
		VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
	`).bind(id, firstName, lastName, email, dateOfBirth).run();
}

export async function updateUser(
	env: Env,
	id: string,
	firstName: string,
	lastName: string,
	email: string,
	dateOfBirth: string | null = null,
): Promise<number> {
	const result = await env.DB.prepare(`
		UPDATE users
		SET firstName = ?, lastName = ?, email = ?, dateOfBirth = ?, updatedAt = CURRENT_TIMESTAMP
		WHERE id = ? AND deletedAt IS NULL
	`).bind(firstName, lastName, email, dateOfBirth, id).run();
	return result.meta.changes;
}

export async function softDeleteUser(env: Env, id: string): Promise<number> {
	const result = await env.DB.prepare(`
		UPDATE users
		SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
		WHERE id = ? AND deletedAt IS NULL
	`).bind(id).run();
	return result.meta.changes;
}
