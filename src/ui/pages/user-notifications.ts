import type { NotificationRow, UserRow } from "../../types";
import { layout, avatarStyle, initials, formatDateTime, notifBadgeClass } from "../layout";

export function userNotificationsPage(
	user: UserRow,
	notifications: NotificationRow[],
	flash?: { type: "success" | "error"; message: string },
): string {
	const { bg, color } = avatarStyle(user.firstName);
	const unread = notifications.filter(n => !n.isRead).length;

	const toastHtml = flash
		? `<div class="toast toast-${flash.type}" id="toast">${flash.message}</div>
       <script>setTimeout(()=>{ const t=document.getElementById('toast'); if(t) t.style.opacity='0'; },3000);</script>`
		: "";

	const rows = notifications.map((n) => {
		const badgeClass = notifBadgeClass(n.type);
		const rowClass = n.isRead ? "notif-read" : "notif-unread";
		return /* html */ `
      <div class="card-static px-5 py-4 flex items-start gap-4 ${rowClass}">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-0.5">
            <span class="tag ${badgeClass}">${n.type}</span>
            <span class="font-semibold text-[#1a1a1a] text-sm">${n.title}</span>
            ${!n.isRead ? `<span class="w-2 h-2 rounded-full bg-[#1a1a1a] inline-block" title="Unread"></span>` : ""}
          </div>
          <p class="text-[#5a5550] text-sm leading-snug">${n.message}</p>
          <p class="text-xs text-[#b0a898] mt-1.5">${formatDateTime(n.createdAt)}${n.readAt ? ` · Read ${formatDateTime(n.readAt)}` : ""}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${!n.isRead ? `
          <form method="POST" action="/ui/notifications/${n.id}/read">
            <input type="hidden" name="_redirect" value="/ui/users/${user.id}/notifications" />
            <button class="btn-secondary btn-sm">✓ Read</button>
          </form>` : `<span class="text-xs text-[#b0a898]">Read</span>`}
          <form method="POST" action="/ui/notifications/${n.id}/delete" onsubmit="return confirm('Delete this notification?')">
            <input type="hidden" name="_redirect" value="/ui/users/${user.id}/notifications" />
            <button class="btn-danger btn-sm">✕</button>
          </form>
        </div>
      </div>`;
	}).join("");

	const emptyState = /* html */ `
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#9a9080" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <p class="serif text-xl text-[#1a1a1a] mb-1">No notifications</p>
      <p class="text-[#9a9080] text-sm">This user has no notifications yet.</p>
    </div>`;

	const body = /* html */ `
    ${toastHtml}

    <div class="mb-8 fade-up">
      <a href="/ui/users" class="inline-flex items-center gap-1.5 text-[#9a9080] text-sm hover:text-[#1a1a1a] transition-colors mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Users
      </a>

      <!-- User identity bar -->
      <div class="card-static p-5 flex items-center gap-4 mb-6 fade-up fade-up-1">
        <div class="avatar text-lg" style="background:${bg}; color:${color}; width:56px; height:56px; border-radius:16px;">
          ${initials(user.firstName, user.lastName)}
        </div>
        <div class="flex-1">
          <p class="font-semibold text-[#1a1a1a]">${user.firstName} ${user.lastName}</p>
          <p class="text-[#9a9080] text-sm">${user.email}</p>
        </div>
        <div class="flex items-center gap-3">
          ${unread > 0 ? `
          <form method="POST" action="/ui/users/${user.id}/notifications/read-all">
            <button class="btn-secondary btn-sm">✓ Mark all read</button>
          </form>` : `<span class="tag bg-[#eafaf1] text-[#1e8449]">All read</span>`}
          <a href="/ui/users/${user.id}/edit" class="btn-secondary btn-sm">Edit User</a>
        </div>
      </div>

      <div class="flex items-end justify-between mb-4">
        <div>
          <p class="text-[#9a9080] text-sm font-medium uppercase tracking-widest mb-1">Notifications</p>
          <h1 class="serif text-3xl text-[#1a1a1a]">${user.firstName}'s Feed</h1>
        </div>
        <span class="tag bg-[#f0ede8] text-[#7a7060]">${notifications.length} total · ${unread} unread</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 fade-up fade-up-2">
      ${notifications.length === 0 ? emptyState : rows}
    </div>`;

	return layout(`${user.firstName}'s Notifications`, body, "notifications");
}
