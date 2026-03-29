import { Hono } from "hono";
import users from "./routes/users";

const app = new Hono<{ Bindings: Env }>();

// ---- Misc routes ----
app.get("/message", (c) => c.text("Hello, World to you all!"));
app.get("/random", (c) => c.text(crypto.randomUUID()));

// ---- Users CRUD API ----
app.route("/users", users);

export default app;