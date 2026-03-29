import { Hono } from "hono";
import users        from "./routes/users";
import notifications from "./routes/notifications";
import ui           from "./routes/ui";

const app = new Hono<{ Bindings: Env }>();

// ── Misc ──────────────────────────────────────────────────────
app.get("/message", (c) => c.text("Hello, World to you all!"));
app.get("/random",  (c) => c.text(crypto.randomUUID()));

// ── REST API ──────────────────────────────────────────────────
app.route("/users",         users);
app.route("/notifications", notifications);

// ── UI Pages ──────────────────────────────────────────────────
app.route("/ui", ui);

// ── Root redirect ─────────────────────────────────────────────
app.get("/", (c) => c.redirect("/ui/users"));

export default app;
