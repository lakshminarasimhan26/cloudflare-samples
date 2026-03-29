import { Hono } from "hono";
import {
	getAllNotifications,
	getNotificationsByUserId,
	getNotificationById,
	createNotification,
	markNotificationRead,
	markAllReadForUser,
	deleteNotification,
} from "../db/notifications";
import { getUserById } from "../db/users";

const notifications = new Hono<{ Bindings: Env }>();

// GET /notifications — all notifications (dashboard feed)
notifications.get("/", async (c) => {
	const results = await getAllNotifications(c.env);
	return c.json({ notifications: results });
});

// GET /notifications/:id — single notification
notifications.get("/:id", async (c) => {
	const n = await getNotificationById(c.env, c.req.param("id"));
	if (!n) return c.json({ error: "Not Found" }, 404);
	return c.json(n);
});

// POST /notifications — create a notification for a user
notifications.post("/", async (c) => {
	let payload: unknown;
	try { payload = await c.req.json(); } catch {
		return c.json({ error: "Invalid JSON body" }, 400);
	}

	const p = payload as Record<string, unknown>;
	const { userId, type, title, message } = p;

	if (!userId || !type || !title || !message) {
		return c.json({ error: "Body must include userId, type, title, and message" }, 400);
	}

	const validTypes = ["info", "warning", "success", "error"];
	if (!validTypes.includes(type as string)) {
		return c.json({ error: `type must be one of: ${validTypes.join(", ")}` }, 400);
	}

	const user = await getUserById(c.env, userId as string);
	if (!user) return c.json({ error: "User not found" }, 404);

	const id = crypto.randomUUID();
	await createNotification(c.env, id, userId as string, type as string, title as string, message as string);
	const created = await getNotificationById(c.env, id);
	return c.json(created, 201);
});

// PATCH /notifications/:id/read — mark one as read
notifications.patch("/:id/read", async (c) => {
	const changes = await markNotificationRead(c.env, c.req.param("id"));
	if (changes === 0) return c.json({ error: "Notification not found or already read" }, 404);
	const updated = await getNotificationById(c.env, c.req.param("id"));
	return c.json(updated);
});

// PATCH /notifications/user/:userId/read-all — mark all read for a user
notifications.patch("/user/:userId/read-all", async (c) => {
	const changes = await markAllReadForUser(c.env, c.req.param("userId"));
	return c.json({ markedRead: changes });
});

// DELETE /notifications/:id — delete a notification
notifications.delete("/:id", async (c) => {
	const changes = await deleteNotification(c.env, c.req.param("id"));
	if (changes === 0) return c.json({ error: "Not Found" }, 404);
	return c.json({ deleted: true });
});

// GET /notifications/user/:userId — all notifications for a user
notifications.get("/user/:userId", async (c) => {
	const user = await getUserById(c.env, c.req.param("userId"));
	if (!user) return c.json({ error: "User not found" }, 404);
	const results = await getNotificationsByUserId(c.env, c.req.param("userId"));
	return c.json({ notifications: results });
});

export default notifications;
