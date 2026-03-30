export type UserRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	dateOfBirth: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type CreateUserInput = {
	firstName: string;
	lastName: string;
	email: string;
	dateOfBirth?: string | null;
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
	isRead: number;
	createdAt: string;
	readAt: string | null;
};

export type NotificationWithUser = NotificationRow & {
	firstName: string;
	lastName: string;
	email: string;
};

// ── R2 Import ─────────────────────────────────────────────────

// Shape of each record inside an R2 JSON file
export type R2UserRecord = {
	firstName: string;
	lastName: string;
	email: string;
	dateOfBirth?: string;
};

export type R2ImportLogRow = {
	id: string;
	r2Key: string;
	status: "success" | "partial" | "failed";
	usersFound: number;
	usersAdded: number;
	usersSkipped: number;
	errorMessage: string | null;
	importedAt: string;
};
