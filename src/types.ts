export type UserRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type CreateUserInput = {
	firstName: string;
	lastName: string;
	email: string;
};

export type UpdateUserInput = CreateUserInput;

// ── Notifications ─────────────────────────────────────────────

export type NotificationType = "info" | "warning" | "success" | "error";

export type NotificationRow = {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	isRead: number; // 0 | 1 (SQLite boolean)
	createdAt: string;
	readAt: string | null;
};

// Joined shape used in dashboard / per-user views
export type NotificationWithUser = NotificationRow & {
	firstName: string;
	lastName: string;
	email: string;
};
