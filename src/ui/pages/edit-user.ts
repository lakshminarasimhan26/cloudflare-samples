import type { UserRow } from "../../types";
import { layout, avatarStyle, initials, formatDate } from "../layout";

export function editUserPage(user: UserRow, error?: string): string {
	const { bg, color } = avatarStyle(user.firstName);

	const errorBanner = error
		? `<div class="bg-[#fff0f0] border border-[#f5c6c6] text-[#c0392b] text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${error}
       </div>`
		: "";

	const body = /* html */ `
    <!-- Delete Confirmation Modal -->
    <div id="deleteModal"
         class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden items-center justify-center"
         onclick="if(event.target===this) closeModal()">
      <div class="bg-white rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl" onclick="event.stopPropagation()">
        <div class="w-12 h-12 rounded-xl bg-[#fff0f0] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h3 class="serif text-xl text-[#1a1a1a] mb-1">Delete User?</h3>
        <p class="text-[#9a9080] text-sm mb-6">
          <strong class="text-[#3a3530]">${user.firstName} ${user.lastName}</strong> will be permanently removed. This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <form method="POST" action="/ui/users/${user.id}/delete" class="flex-1">
            <button type="submit" class="btn-danger w-full justify-center">Yes, Delete</button>
          </form>
          <button onclick="closeModal()" class="btn-secondary flex-1 justify-center">Cancel</button>
        </div>
      </div>
    </div>

    <div class="max-w-lg mx-auto">

      <div class="mb-8 fade-up">
        <a href="/ui/users" class="inline-flex items-center gap-1.5 text-[#9a9080] text-sm hover:text-[#1a1a1a] transition-colors mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Users
        </a>
        <p class="text-[#9a9080] text-sm font-medium uppercase tracking-widest mb-1">Users</p>
        <h1 class="serif text-4xl text-[#1a1a1a]">Edit User</h1>
      </div>

      <!-- User identity card -->
      <div class="card-static p-5 mb-4 flex items-center gap-4 fade-up fade-up-1">
        <div class="avatar text-lg" style="background:${bg}; color:${color}; width:56px; height:56px; border-radius:16px;">
          ${initials(user.firstName, user.lastName)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-[#1a1a1a]">${user.firstName} ${user.lastName}</p>
          <p class="text-[#9a9080] text-sm truncate">${user.email}</p>
          ${user.dateOfBirth ? `<p class="text-[#b0a898] text-xs mt-0.5">DOB: ${user.dateOfBirth}</p>` : ""}
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="text-right text-xs text-[#b0a898]">
            <p>Joined</p>
            <p class="font-medium text-[#7a7060]">${formatDate(user.createdAt)}</p>
          </div>
          <a href="/ui/users/${user.id}/notifications"
             class="text-xs text-[#9a9080] hover:text-[#1a1a1a] transition-colors underline underline-offset-2">
            View notifications →
          </a>
        </div>
      </div>

      <!-- Edit form -->
      <div class="card-static p-7 fade-up fade-up-2">
        ${errorBanner}
        <form method="POST" action="/ui/users/${user.id}/edit" class="flex flex-col gap-5">

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-[#3a3530]" for="firstName">First Name</label>
              <input class="form-input" type="text" id="firstName" name="firstName"
                     value="${user.firstName}" required autocomplete="given-name" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-[#3a3530]" for="lastName">Last Name</label>
              <input class="form-input" type="text" id="lastName" name="lastName"
                     value="${user.lastName}" required autocomplete="family-name" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-[#3a3530]" for="email">Email Address</label>
            <input class="form-input" type="email" id="email" name="email"
                   value="${user.email}" required autocomplete="email" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-[#3a3530]" for="dateOfBirth">
              Date of Birth <span class="text-[#b0a898] font-normal">(optional)</span>
            </label>
            <input class="form-input" type="date" id="dateOfBirth" name="dateOfBirth"
                   value="${user.dateOfBirth ?? ""}" />
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-3">
              <button type="submit" class="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Save Changes
              </button>
              <a href="/ui/users" class="btn-secondary">Cancel</a>
            </div>
            <button type="button" onclick="openModal()" class="btn-danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
              Delete
            </button>
          </div>

        </form>
      </div>

      <!-- Meta info -->
      <div class="mt-4 px-1 flex gap-6 text-xs text-[#b0a898] fade-up fade-up-3">
        <span>ID: <code class="font-mono text-[#9a9080]">${user.id}</code></span>
        <span>Updated: ${formatDate(user.updatedAt)}</span>
      </div>

    </div>

    <script>
      function openModal()  {
        const m = document.getElementById('deleteModal');
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
      function closeModal() {
        const m = document.getElementById('deleteModal');
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
      document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
    </script>`;

	return layout(`Edit ${user.firstName} ${user.lastName}`, body);
}
