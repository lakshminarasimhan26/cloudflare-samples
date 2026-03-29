import type { NotificationRow, NotificationWithUser } from "../types";

// ── Queries ───────────────────────────────────────────────────

export async function getAllNotifications(env: Env): Promise<NotificationWithUser[]> {
	const { results } = await env.DB.prepare(`
		SELECT n.*, u.firstName, u.lastName, u.email
		FROM notifications n
		JOIN users u ON u.id = n.userId
		WHERE u.deletedAt IS NULL
		ORDER BY n.createdAt DESC
	`).all<NotificationWithUser>();
	return results;
}

export async function getNotificationsByUserId(env: Env, userId: string): Promise<NotificationRow[]> {
	const { results } = await env.DB.prepare(`
		SELECT * FROM notifications
		WHERE userId = ?
		ORDER BY createdAt DESC
	`).bind(userId).all<NotificationRow>();
	return results;
}

export async function getNotificationById(env: Env, id: string): Promise<NotificationRow | null> {
	return await env.DB.prepare(
		"SELECT * FROM notifications WHERE id = ?"
	).bind(id).first<NotificationRow>();
}

export async function createNotification(
	env: Env,
	id: string,
	userId: string,
	type: string,
	title: string,
	message: string,
): Promise<void> {
	await env.DB.prepare(`
		INSERT INTO notifications (id, userId, type, title, message, isRead, createdAt, readAt)
		VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, NULL)
	`).bind(id, userId, type, title, message).run();
}

export async function markNotificationRead(env: Env, id: string): Promise<number> {
	const result = await env.DB.prepare(`
		UPDATE notifications
		SET isRead = 1, readAt = CURRENT_TIMESTAMP
		WHERE id = ? AND isRead = 0
	`).bind(id).run();
	return result.meta.changes;
}

export async function markAllReadForUser(env: Env, userId: string): Promise<number> {
	const result = await env.DB.prepare(`
		UPDATE notifications
		SET isRead = 1, readAt = CURRENT_TIMESTAMP
		WHERE userId = ? AND isRead = 0
	`).bind(userId).run();
	return result.meta.changes;
}

export async function deleteNotification(env: Env, id: string): Promise<number> {
	const result = await env.DB.prepare(
		"DELETE FROM notifications WHERE id = ?"
	).bind(id).run();
	return result.meta.changes;
}

export async function getUnreadCountByUserId(env: Env, userId: string): Promise<number> {
	const row = await env.DB.prepare(
		"SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0"
	).bind(userId).first<{ count: number }>();
	return row?.count ?? 0;
}
