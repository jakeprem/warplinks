import { error, html, json, Router, withContent } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';

import { hash, verify } from './passwordHasher';
import { authRouter } from './authRouter';
import { inviteCodes, sessions, users } from './schema';
import { and, eq } from 'drizzle-orm';
import { loginPage } from './pages/login';
import { linksPage } from './pages/links';

export interface Env {
	DB: D1Database;
}

const extractSessionId = (request: Request) => {
	return request.headers
		.get('cookie')
		?.split(';')
		.find((c) => c.startsWith('sessionId='))
		?.split('=')[1];
};

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

		return linksPage({ userEmail: user.email, db });
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
			console.log(sessionId);
			const res = await db.insert(sessions).values({ sessionId, userId: possibleUser.id }).run();

			console.log(res);
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
			console.log(err);
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
			console.log(res);
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
	.get('/-/invite_codes', async (request, extra) => {
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

		const codes = await db.select().from(inviteCodes).all();
		console.log(codes);

		return json({ codes });
	})
	.get('*', async (request) => {
		return json({ message: `This is where the golink would go:` });
	});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const pepper = 'pepper';
		const db = drizzle(env.DB);

		return router.handle(request, { db, pepper }).catch(error);
	},
};
