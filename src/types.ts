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