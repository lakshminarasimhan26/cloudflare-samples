export function layout(title: string, body: string): string {
	return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — UserBase</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { font-family: 'DM Sans', sans-serif; }
    h1, h2, .serif { font-family: 'DM Serif Display', serif; }

    body { background: #f5f3ef; }

    .card {
      background: #ffffff;
      border: 1px solid #e5e0d8;
      border-radius: 16px;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .card:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }

    .btn-primary {
      background: #1a1a1a;
      color: #fff;
      border-radius: 10px;
      padding: 10px 22px;
      font-weight: 500;
      font-size: 0.9rem;
      transition: background 0.15s ease, transform 0.1s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border: none;
    }
    .btn-primary:hover { background: #333; transform: translateY(-1px); }

    .btn-secondary {
      background: transparent;
      color: #1a1a1a;
      border: 1.5px solid #d0cac0;
      border-radius: 10px;
      padding: 10px 22px;
      font-weight: 500;
      font-size: 0.9rem;
      transition: border-color 0.15s, background 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .btn-secondary:hover { border-color: #1a1a1a; background: #f0ede8; }

    .btn-danger {
      background: #fff0f0;
      color: #c0392b;
      border: 1.5px solid #f5c6c6;
      border-radius: 10px;
      padding: 10px 22px;
      font-weight: 500;
      font-size: 0.9rem;
      transition: background 0.15s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .btn-danger:hover { background: #ffe0e0; border-color: #c0392b; }

    .form-input {
      width: 100%;
      border: 1.5px solid #e0dbd2;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.95rem;
      background: #faf9f7;
      color: #1a1a1a;
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
    }
    .form-input:focus {
      border-color: #1a1a1a;
      box-shadow: 0 0 0 3px rgba(26,26,26,0.07);
      background: #fff;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .tag {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 999px;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-up-1 { animation-delay: 0.05s; }
    .fade-up-2 { animation-delay: 0.10s; }
    .fade-up-3 { animation-delay: 0.15s; }

    .toast {
      position: fixed; bottom: 28px; right: 28px;
      padding: 14px 22px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      z-index: 9999;
      animation: fadeUp 0.3s ease both;
    }
    .toast-success { background: #1a1a1a; color: #fff; }
    .toast-error   { background: #c0392b; color: #fff; }
  </style>
</head>
<body class="min-h-screen">

  <!-- Nav -->
  <nav class="bg-white border-b border-[#e5e0d8] sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <a href="/ui/users" class="serif text-xl text-[#1a1a1a] tracking-tight">UserBase</a>
      <a href="/ui/users/new" class="btn-primary text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New User
      </a>
    </div>
  </nav>

  <!-- Page Content -->
  <main class="max-w-5xl mx-auto px-6 py-10">
    ${body}
  </main>

</body>
</html>`;
}

const AVATAR_COLORS = [
	["#e8f4fd", "#2980b9"],
	["#fef9e7", "#c0a020"],
	["#eafaf1", "#1e8449"],
	["#fdf2f8", "#9b59b6"],
	["#fef5e7", "#ca6f1e"],
	["#f0f3ff", "#2e4bc6"],
];

export function avatarStyle(name: string): { bg: string; color: string } {
	const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
	const [bg, color] = AVATAR_COLORS[idx];
	return { bg, color };
}

export function initials(firstName: string, lastName: string): string {
	return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}