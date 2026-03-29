import type { NotificationWithUser } from "../../types";
import { layout, avatarStyle, initials, formatDateTime, notifBadgeClass } from "../layout";

type Stats = { total: number; unread: number; info: number; warning: number; success: number; error: number };

function buildStats(notifications: NotificationWithUser[]): Stats {
	return {
		total:   notifications.length,
		unread:  notifications.filter(n => !n.isRead).length,
		info:    notifications.filter(n => n.type === "info").length,
		warning: notifications.filter(n => n.type === "warning").length,
		success: notifications.filter(n => n.type === "success").length,
		error:   notifications.filter(n => n.type === "error").length,
	};
}

export function notificationsDashboardPage(
	notifications: NotificationWithUser[],
	flash?: { type: "success" | "error"; message: string },
): string {
	const stats = buildStats(notifications);

	const toastHtml = flash
		? `<div class="toast toast-${flash.type}" id="toast">${flash.message}</div>
       <script>setTimeout(()=>{ const t=document.getElementById('toast'); if(t) t.style.opacity='0'; },3000);</script>`
		: "";

	const statCard = (label: string, value: number, accent: string) => /* html */ `
    <div class="card-static p-5 flex flex-col gap-1">
      <span class="text-[#9a9080] text-xs font-semibold uppercase tracking-widest">${label}</span>
      <span class="text-3xl font-semibold text-[#1a1a1a]" style="color:${accent}">${value}</span>
    </div>`;

	const statsHtml = /* html */ `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 fade-up fade-up-1">
      ${statCard("Total",   stats.total,   "#1a1a1a")}
      ${statCard("Unread",  stats.unread,  "#1a1a1a")}
      ${statCard("Info",    stats.info,    "#2980b9")}
      ${statCard("Success", stats.success, "#1e8449")}
      ${statCard("Warning", stats.warning, "#c0a020")}
      ${statCard("Error",   stats.error,   "#c0392b")}
    </div>`;

	const rows = notifications.map((n) => {
		const { bg, color } = avatarStyle(n.firstName);
		const badgeClass = notifBadgeClass(n.type);
		const rowClass = n.isRead ? "notif-read" : "notif-unread";
		return /* html */ `
      <div class="card-static px-5 py-4 flex items-start gap-4 ${rowClass}">
        <a href="/ui/users/${n.userId}/notifications" title="View user notifications">
          <div class="avatar mt-0.5" style="background:${bg}; color:${color}; width:40px; height:40px; border-radius:12px; font-size:0.85rem;">
            ${initials(n.firstName, n.lastName)}
          </div>
        </a>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-0.5">
            <span class="tag ${badgeClass}">${n.type}</span>
            <span class="font-semibold text-[#1a1a1a] text-sm">${n.title}</span>
            ${!n.isRead ? `<span class="w-2 h-2 rounded-full bg-[#1a1a1a] inline-block" title="Unread"></span>` : ""}
          </div>
          <p class="text-[#5a5550] text-sm leading-snug">${n.message}</p>
          <div class="flex items-center gap-3 mt-1.5 text-xs text-[#b0a898]">
            <a href="/ui/users/${n.userId}/notifications" class="hover:text-[#1a1a1a] transition-colors font-medium">
              ${n.firstName} ${n.lastName}
            </a>
            <span>·</span>
            <span>${formatDateTime(n.createdAt)}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${!n.isRead ? `
          <form method="POST" action="/ui/notifications/${n.id}/read">
            <button class="btn-secondary btn-sm" title="Mark as read">✓ Read</button>
          </form>` : `<span class="text-xs text-[#b0a898]">Read</span>`}
          <form method="POST" action="/ui/notifications/${n.id}/delete" onsubmit="return confirm('Delete this notification?')">
            <button class="btn-danger btn-sm" title="Delete">✕</button>
          </form>
        </div>
      </div>`;
	}).join("");

	const emptyState = /* html */ `
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <div class="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#9a9080" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <p class="serif text-2xl text-[#1a1a1a] mb-2">No notifications yet</p>
      <p class="text-[#9a9080] text-sm">Notifications will appear here when created.</p>
    </div>`;

	const body = /* html */ `
    ${toastHtml}

    <div class="flex items-end justify-between mb-8 fade-up">
      <div>
        <p class="text-[#9a9080] text-sm font-medium uppercase tracking-widest mb-1">Overview</p>
        <h1 class="serif text-4xl text-[#1a1a1a]">Notifications</h1>
      </div>
      ${stats.unread > 0
        ? `<span class="tag bg-[#1a1a1a] text-white">${stats.unread} unread</span>`
        : `<span class="tag bg-[#eafaf1] text-[#1e8449]">All caught up</span>`}
    </div>

    ${statsHtml}

    <div class="flex flex-col gap-2 fade-up fade-up-2">
      ${notifications.length === 0 ? emptyState : rows}
    </div>`;

	return layout("Notifications", body, "notifications");
}
