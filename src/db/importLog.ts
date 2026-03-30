import type { R2ImportLogRow } from "../types";

// ── Import log queries ────────────────────────────────────────

export async function getImportLog(env: Env): Promise<R2ImportLogRow[]> {
	const { results } = await env.DB.prepare(
		"SELECT * FROM r2_import_log ORDER BY importedAt DESC"
	).all<R2ImportLogRow>();
	return results;
}

export async function hasFileBeenImported(env: Env, r2Key: string): Promise<boolean> {
	const row = await env.DB.prepare(
		"SELECT id FROM r2_import_log WHERE r2Key = ?"
	).bind(r2Key).first<{ id: string }>();
	return row !== null;
}

export async function recordImport(
	env: Env,
	id: string,
	r2Key: string,
	status: "success" | "partial" | "failed",
	usersFound: number,
	usersAdded: number,
	usersSkipped: number,
	errorMessage: string | null,
): Promise<void> {
	await env.DB.prepare(`
		INSERT INTO r2_import_log
		  (id, r2Key, status, usersFound, usersAdded, usersSkipped, errorMessage, importedAt)
		VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`).bind(id, r2Key, status, usersFound, usersAdded, usersSkipped, errorMessage).run();
}
