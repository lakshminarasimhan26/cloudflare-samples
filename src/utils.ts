import type { CreateUserInput } from "./types";

export function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export async function readJsonBody<T>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		throw new Error("Invalid JSON");
	}
}

export function coerceCreateUserInput(payload: unknown): CreateUserInput | null {
	if (payload === null || typeof payload !== "object") return null;

	const maybe = payload as Partial<Record<keyof CreateUserInput, unknown>>;
	const { firstName, lastName, email, dateOfBirth } = maybe;

	if (!isNonEmptyString(firstName)) return null;
	if (!isNonEmptyString(lastName))  return null;
	if (!isNonEmptyString(email))     return null;

	// dateOfBirth is optional — accept null, undefined, or a non-empty string
	const dob =
		typeof dateOfBirth === "string" && dateOfBirth.trim().length > 0
			? dateOfBirth.trim()
			: null;

	return {
		firstName:   firstName.trim(),
		lastName:    lastName.trim(),
		email:       normalizeEmail(email),
		dateOfBirth: dob,
	};
}

export function isUniqueEmailError(err: unknown): boolean {
	const msg = err instanceof Error ? err.message : String(err);
	return /unique constraint failed/i.test(msg) && /users\.email/i.test(msg);
}
