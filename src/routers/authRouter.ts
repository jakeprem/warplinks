import { IRequest, Router, html, json, withContent } from 'itty-router';
import { hash, verify } from '../passwordHasher';
import { inviteCodes, sessions, users } from '../schema';
import { eq, and } from 'drizzle-orm';
import { extractSessionId } from '../utils';

const authRouter = Router({ base: '/-/auth' });

authRouter
	.post('/login', withContent, async (request, extra) => {
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
	.post('/register', withContent, async (request, extra) => {
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
	.post('/logout', async (request, extra) => {
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
	.all('*', async (request, extra) => {
		return json({ error: 'invalid route', url: request.url }, { status: 200 });
	});

export { authRouter };
