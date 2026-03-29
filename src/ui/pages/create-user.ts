import { layout } from "../layout";

export function createUserPage(error?: string): string {
	const errorBanner = error
		? `<div class="bg-[#fff0f0] border border-[#f5c6c6] text-[#c0392b] text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${error}
       </div>`
		: "";

	const body = /* html */ `
    <div class="max-w-lg mx-auto">

      <div class="mb-8 fade-up">
        <a href="/ui/users" class="inline-flex items-center gap-1.5 text-[#9a9080] text-sm hover:text-[#1a1a1a] transition-colors mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Users
        </a>
        <p class="text-[#9a9080] text-sm font-medium uppercase tracking-widest mb-1">Users</p>
        <h1 class="serif text-4xl text-[#1a1a1a]">New User</h1>
      </div>

      <div class="card p-7 fade-up fade-up-1">
        ${errorBanner}
        <form method="POST" action="/ui/users/new" class="flex flex-col gap-5">

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-[#3a3530]" for="firstName">First Name</label>
              <input class="form-input" type="text" id="firstName" name="firstName"
                     placeholder="John" required autocomplete="given-name" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-[#3a3530]" for="lastName">Last Name</label>
              <input class="form-input" type="text" id="lastName" name="lastName"
                     placeholder="Doe" required autocomplete="family-name" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-[#3a3530]" for="email">Email Address</label>
            <input class="form-input" type="email" id="email" name="email"
                   placeholder="john.doe@example.com" required autocomplete="email" />
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" class="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Create User
            </button>
            <a href="/ui/users" class="btn-secondary">Cancel</a>
          </div>

        </form>
      </div>
    </div>`;

	return layout("New User", body);
}