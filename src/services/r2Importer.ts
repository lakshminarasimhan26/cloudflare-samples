import type { R2UserRecord } from "../types";
import { createUser, getUserByEmail } from "../db/users";
import { hasFileBeenImported, recordImport } from "../db/importLog";

// Expected JSON shape in each R2 file:
// [
//   { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "dateOfBirth": "1990-05-14" },
//   ...
// ]

export type ImportResult = {
	r2Key: string;
	usersFound: number;
	usersAdded: number;
	usersSkipped: number;
	status: "success" | "partial" | "failed";
	error?: string;
};

function isValidRecord(r: unknown): r is R2UserRecord {
	if (!r || typeof r !== "object") return false;
	const rec = r as Record<string, unknown>;
	return (
		typeof rec.firstName === "string" && rec.firstName.trim().length > 0 &&
		typeof rec.lastName  === "string" && rec.lastName.trim().length  > 0 &&
		typeof rec.email     === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec.email.trim())
	);
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

async function processFile(env: Env, r2Key: string): Promise<ImportResult> {
	const result: ImportResult = {
		r2Key,
		usersFound: 0,
		usersAdded: 0,
		usersSkipped: 0,
		status: "success",
	};

	// Fetch the object from R2
	const object = await env.USER_IMPORTS_BUCKET.get(r2Key);
	if (!object) {
		return { ...result, status: "failed", error: `Object not found in R2: ${r2Key}` };
	}

	let records: unknown[];
	try {
		const text = await object.text();
		const parsed = JSON.parse(text);
		records = Array.isArray(parsed) ? parsed : [parsed];
	} catch (err) {
		return {
			...result,
			status: "failed",
			error: `Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`,
		};
	}

	result.usersFound = records.length;

	for (const record of records) {
		if (!isValidRecord(record)) {
			result.usersSkipped++;
			continue;
		}

		const email = normalizeEmail(record.email);

		// Skip if user already exists (by email)
		const existing = await getUserByEmail(env, email);
		if (existing) {
			result.usersSkipped++;
			continue;
		}

		try {
			await createUser(
				env,
				crypto.randomUUID(),
				record.firstName.trim(),
				record.lastName.trim(),
				email,
				record.dateOfBirth?.trim() ?? null,
			);
			result.usersAdded++;
		} catch {
			// Catches any race-condition duplicate inserts
			result.usersSkipped++;
		}
	}

	if (result.usersAdded === 0 && result.usersFound > 0) {
		result.status = "partial"; // found records but all were skipped
	}

	return result;
}

export async function runR2Import(env: Env): Promise<ImportResult[]> {
	const results: ImportResult[] = [];

	// List all objects in the bucket
	const listed = await env.USER_IMPORTS_BUCKET.list();
	const jsonKeys = listed.objects
		.filter((obj: R2Object) => obj.key.endsWith(".json"))
		.map((obj: R2Object) => obj.key);

	for (const r2Key of jsonKeys) {
		// Skip files we've already processed
		const alreadyDone = await hasFileBeenImported(env, r2Key);
		if (alreadyDone) continue;

		const result = await processFile(env, r2Key);

		// Record the outcome regardless of success/failure
		await recordImport(
			env,
			crypto.randomUUID(),
			r2Key,
			result.status,
			result.usersFound,
			result.usersAdded,
			result.usersSkipped,
			result.error ?? null,
		);

		results.push(result);
	}

	return results;
}
