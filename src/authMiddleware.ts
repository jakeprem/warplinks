import { IRequest, json } from 'itty-router';
import { extractSessionId } from './utils';
import { sessions, users } from './schema';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export const withRequireUser = async (request: IRequest, extra: { db: DrizzleD1Database; pepper: string }) => {
	const sessionId = extractSessionId(request);
	if (!sessionId) {
		return json({ error: 'not logged in' }, { status: 400 });
	}
	const { db } = extra;
	const session = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.sessionId, sessionId)).get();

	if (!session) {
		return json({ error: 'not logged in' }, { status: 400 });
	}

	const user = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, session.userId)).get();

	if (!user) {
		return json({ error: 'not logged in' }, { status: 400 });
	}

	request.user = user;
};

// Slightly faster version of withRequireUser. By returning a promise we can let the main handler
// Resolve both the session and whatever data it's looking for at the same time.
// Ideally we should load the user with the session but this is a start.
// Also we should profile different approaches:
// 1. Load the session
// 2. Load the user via the session
// 3. Store a JWT in the cookie and verify it.
//
// All 3 approaches could return a promise from here that could be resolved in paralell with the link,
// but we'd need to profile to see which one is actually fastest.
export const withFastRequireUser = async (request: IRequest, extra: { db: DrizzleD1Database; pepper: string; waitUntil: Function }) => {
	const sessionId = extractSessionId(request);
	if (!sessionId) {
		return new Response('Please log in.', {
			status: 302,
			headers: {
				location: '/',
			},
		});
	}
	const { db } = extra;
	const sessionPromise = db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.sessionId, sessionId)).get();

	request.sessionPromise = sessionPromise;
	request.userCallback = (userId: number) => {
		return db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).get();
	};
};
