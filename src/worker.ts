import { error, html, IRequest, json, Router, withContent } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';

import { hash, verify } from './passwordHasher';
import { inviteCodes, links, sessions, users } from './schema';
import { and, eq } from 'drizzle-orm';
import { loginPage } from './pages/login';
import { linksPage } from './pages/links';
import { extractSessionId } from './utils';
import { withFastRequireUser, withRequireUser } from './authMiddleware';

export interface Env {
	DB: D1Database;
}

type Extras = [db: D1Database; pepper: string; waitUntil: Function];

const router = Router();
router
	.get('/', async (request, extra) => {
		const sessionId = extractSessionId(request);

		if (!sessionId) {
			return loginPage();
		}

		const { db } = extra;

		const session = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.sessionId, sessionId)).get();

		if (!session) {
			return loginPage();
		}

		const user = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, session.userId)).get();

		if (!user) {
			return loginPage();
		}

		return linksPage({ userEmail: user.email });
	})
	.post('/-/login', withContent, async (request, extra) => {
		const { db, pepper } = extra;
		const { email, password } = request.content;

		if (!email || !password) {
			return json({ error: 'missing email or password' }, { status: 400 });
		}

		const possibleUser = await db
			.select({ id: users.id, email: users.email, password: users.password })
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (!possibleUser) {
			return json({ error: 'invalid email or password' }, { status: 400 });
		}

		const valid = await verify({
			hash: possibleUser.password,
			password,
			pepper,
		});

		if (!valid) {
			return json({ error: 'invalid email or password' }, { status: 400 });
		}

		try {
			const sessionId = crypto.randomUUID();
			const res = await db.insert(sessions).values({ sessionId, userId: possibleUser.id }).run();

			if (res.success) {
				return json(
					{ message: 'success' },
					{
						status: 301,
						headers: {
							location: '/',
							'set-cookie': `sessionId=${sessionId}; path=/; HttpOnly; Secure; SameSite=Strict`,
						},
					}
				);
			}
		} catch (err) {
			return json({ error: 'login failed' }, { status: 500 });
		}
	})
	.post('/-/register', withContent, async (request, extra) => {
		const { db, pepper } = extra;
		const { email, password, passwordVerify, inviteCode } = request.content;

		if (!email || !password || !passwordVerify || !inviteCode) {
			return json({ error: 'missing email or password' }, { status: 400 });
		}

		if (password !== passwordVerify) {
			return json({ error: 'passwords do not match' }, { status: 400 });
		}

		const invite = await db
			.select({ id: inviteCodes.id, active: inviteCodes.active })
			.from(inviteCodes)
			.where(and(eq(inviteCodes.code, inviteCode), eq(inviteCodes.active, true)))
			.get();

		if (!invite) {
			return json({ error: 'invalid invite code' }, { status: 400 });
		}

		const hashedPassword = await hash({ password: request.content.password, pepper });

		try {
			const res = await db.insert(users).values({ email, password: hashedPassword }).run();
			if (res.success) {
				return json({ message: 'success' }, { status: 301, headers: { location: '/' } });
			}
		} catch (err) {
			if (err.cause.toString().includes('constraint failed')) {
				return json({ error: 'email already exists' }, { status: 400 });
			}
		}
	})
	.post('/-/logout', async (request, extra) => {
		const sessionId = extractSessionId(request);

		if (!sessionId) {
			return json({ error: 'not logged in' }, { status: 400 });
		}
		const { db } = extra;
		await db.delete(sessions).where(eq(sessions.sessionId, sessionId)).run();

		return json(
			{ message: 'success' },
			{
				status: 301,
				headers: {
					location: '/',
					'set-cookie': `sessionId=; path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
				},
			}
		);
	})
	.get('/-/invite_codes', withRequireUser, async (request, extra) => {
		const { db } = extra;

		if (!request.user) {
			// the middleware should prevent this, but i feel better having it here for now
			console.error('no user, but there should be here');
			return json({ error: 'not logged in' }, { status: 400 });
		}

		const codes = await db.select().from(inviteCodes).all();

		return json({ codes });
	})
	.get('/-/links', withRequireUser, async (request, extra) => {
		const { db } = extra;

		if (!request.user) {
			// the middleware should prevent this, but i feel better having it here for now
			console.error('no user, but there should be here');
			return json({ error: 'not logged in' }, { status: 400 });
		}

		const allLinks = await db.select().from(links).all();

		return json({ links: allLinks });
	})
	.get('/-/:rest+', async (request, extra) => {
		return json({ message: 'no api route here' });
	})
	.get('/favicon.ico', async () => {
		return json({ message: 'no favicon' }, { status: 404 });
	})
	.get('*', withFastRequireUser, async (request, { db, waitUntil }) => {
		const [key, ...parts] = request.url
			.toLowerCase()
			.replace(/https?:\/\//, '')
			.split('/')
			.filter((x) => x !== '')
			.slice(1);

		const linkPromise = db.select().from(links).where(eq(links.key, key)).get();

		const [session, link] = await Promise.all([request.sessionPromise, linkPromise]);

		if (!session) {
			return new Response('Please login first.', { status: 302, headers: { location: '/' } });
		}
		waitUntil(async () => {
			// If somehow the session exists but the user doesn't,
			// delete their session.
			const user = await request.userCallback(session.userId);

			if (!user) {
				db.delete(sessions).where(eq(sessions.sessionId, session.sessionId)).run();
			}
		});

		if (link) {
			const finalString = parts.reduce((acc, part) => acc.replace('%s', part), link.destination);

			return Response.redirect(finalString, 302);
		}

		return json({ key, message: "here we'd redirect with key to create a new link" });
	});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const pepper = 'pepper';
		const db = drizzle(env.DB);
		const waitUntil = ctx.waitUntil.bind(ctx);

		return router.handle(request, { db, pepper, waitUntil }).catch(error);
	},
};
