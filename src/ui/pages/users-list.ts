import type { UserRow } from "../../types";
import { layout, avatarStyle, initials, formatDate } from "../layout";

export function usersListPage(users: UserRow[], flash?: { type: "success" | "error"; message: string }): string {
	const toastHtml = flash
		? `<div class="toast toast-${flash.type}" id="toast">${flash.message}</div>
       <script>setTimeout(() => { const t = document.getElementById('toast'); if(t) t.style.opacity='0'; }, 3000);</script>`
		: "";

	const emptyState = /* html */ `
    <div class="flex flex-col items-center justify-center py-24 text-center fade-up">
      <div class="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#9a9080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <p class="serif text-2xl text-[#1a1a1a] mb-2">No users yet</p>
      <p class="text-[#9a9080] text-sm mb-6">Create your first user to get started.</p>
      <a href="/ui/users/new" class="btn-primary">+ New User</a>
    </div>`;

	const tiles = users.map((u, i) => {
		const { bg, color } = avatarStyle(u.firstName);
		const delay = Math.min(i, 5);
		return /* html */ `
      <a href="/ui/users/${u.id}/edit"
         class="card p-5 flex flex-col gap-4 no-underline group fade-up fade-up-${delay + 1}"
         style="animation-delay: ${i * 0.05}s">
        <div class="flex items-start justify-between">
          <div class="avatar" style="background:${bg}; color:${color};">
            ${initials(u.firstName, u.lastName)}
          </div>
          <span class="tag" style="background:${bg}; color:${color};">Active</span>
        </div>
        <div>
          <p class="font-600 text-[#1a1a1a] text-base font-semibold leading-tight">
            ${u.firstName} ${u.lastName}
          </p>
          <p class="text-[#9a9080] text-sm mt-0.5 truncate">${u.email}</p>
        </div>
        <div class="border-t border-[#f0ede8] pt-3 flex items-center justify-between">
          <span class="text-[#b0a898] text-xs">Joined ${formatDate(u.createdAt)}</span>
          <svg class="opacity-0 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="#9a9080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </a>`;
	}).join("");

	const body = /* html */ `
    ${toastHtml}
    <div class="flex items-end justify-between mb-8 fade-up">
      <div>
        <p class="text-[#9a9080] text-sm font-medium uppercase tracking-widest mb-1">Directory</p>
        <h1 class="serif text-4xl text-[#1a1a1a]">All Users</h1>
      </div>
      <span class="tag bg-[#f0ede8] text-[#7a7060]">${users.length} ${users.length === 1 ? "user" : "users"}</span>
    </div>

    ${users.length === 0
		? emptyState
		: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${tiles}</div>`
	}`;

	return layout("All Users", body);
}