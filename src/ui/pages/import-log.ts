import type { R2ImportLogRow } from "../../types";
import { layout, formatDateTime } from "../layout";

export function importLogPage(
	logs: R2ImportLogRow[],
	flash?: { type: "success" | "error"; message: string },
): string {
	const toastHtml = flash
		? `<div class="toast toast-${flash.type}" id="toast">${flash.message}</div>
       <script>setTimeout(()=>{ const t=document.getElementById('toast'); if(t) t.style.opacity='0'; },3000);</script>`
		: "";

	const totalAdded   = logs.reduce((s, l) => s + l.usersAdded,   0);
	const totalSkipped = logs.reduce((s, l) => s + l.usersSkipped,  0);
	const totalFailed  = logs.filter(l => l.status === "failed").length;

	const statCard = (label: string, value: number | string, accent: string) => /* html */ `
    <div class="card-static p-5 flex flex-col gap-1">
      <span class="text-[#9a9080] text-xs font-semibold uppercase tracking-widest">${label}</span>
      <span class="text-3xl font-semibold" style="color:${accent}">${value}</span>
    </div>`;

	const statusBadge = (status: string) => {
		const map: Record<string, string> = {
			success: "badge-success",
			partial: "badge-warning",
			failed:  "badge-error",
		};
		return `<span class="tag ${map[status] ?? "badge-info"}">${status}</span>`;
	};

	const rows = logs.map((log) => /* html */ `
    <div class="card-static px-5 py-4 flex items-start gap-4 ${log.status === "failed" ? "border-l-4 border-l-red-300" : log.status === "partial" ? "border-l-4 border-l-yellow-300" : "border-l-4 border-l-green-300"}">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          ${statusBadge(log.status)}
          <code class="text-sm font-mono text-[#3a3530] truncate max-w-xs">${log.r2Key}</code>
        </div>
        ${log.errorMessage
			? `<p class="text-[#c0392b] text-xs mb-1.5 bg-[#fff0f0] px-3 py-1.5 rounded-lg">${log.errorMessage}</p>`
			: ""}
        <div class="flex items-center gap-4 text-xs text-[#9a9080]">
          <span>Found: <strong class="text-[#1a1a1a]">${log.usersFound}</strong></span>
          <span>Added: <strong class="text-[#1e8449]">${log.usersAdded}</strong></span>
          <span>Skipped: <strong class="text-[#c0a020]">${log.usersSkipped}</strong></span>
        </div>
      </div>
      <div class="text-right text-xs text-[#b0a898] shrink-0">
        <p>${formatDateTime(log.importedAt)}</p>
      </div>
    </div>`).join("");

	const emptyState = /* html */ `
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <div class="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#9a9080" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <p class="serif text-2xl text-[#1a1a1a] mb-2">No imports yet</p>
      <p class="text-[#9a9080] text-sm mb-6">Upload a JSON file to your R2 bucket and the cron will process it hourly.</p>
      <a href="/ui/import/trigger" class="btn-primary" onclick="return confirm('Trigger a manual import now?')">
        Run Import Now
      </a>
    </div>`;

	const body = /* html */ `
    ${toastHtml}

    <div class="flex items-end justify-between mb-8 fade-up">
      <div>
        <p class="text-[#9a9080] text-sm font-medium uppercase tracking-widest mb-1">R2 Bucket</p>
        <h1 class="serif text-4xl text-[#1a1a1a]">Import Log</h1>
      </div>
      <form method="POST" action="/ui/import/trigger">
        <button class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Run Import Now
        </button>
      </form>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 fade-up fade-up-1">
      ${statCard("Files Processed", logs.length,  "#1a1a1a")}
      ${statCard("Users Added",     totalAdded,   "#1e8449")}
      ${statCard("Skipped",         totalSkipped, "#c0a020")}
      ${statCard("Failed Files",    totalFailed,  "#c0392b")}
    </div>

    <div class="mb-3 fade-up fade-up-2 flex items-center justify-between">
      <h2 class="font-semibold text-[#1a1a1a]">Import History</h2>
      <span class="text-xs text-[#9a9080]">Auto-runs every hour via cron · <code class="font-mono">0 * * * *</code></span>
    </div>

    <div class="flex flex-col gap-2 fade-up fade-up-2">
      ${logs.length === 0 ? emptyState : rows}
    </div>`;

	return layout("Import Log", body, "import");
}
