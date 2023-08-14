import { error, html, IRequest, json, Router, withContent } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';

import { hash, verify } from './passwordHasher';
import { inviteCodes, links, sessions, users } from './schema';
import { and, eq } from 'drizzle-orm';
import { loginPage } from './pages/login';
import { linksPage } from './pages/links';
import { extractSessionId } from './utils';
import { withFastRequireUser, withRequireUser } from './authMiddleware';
import { dashRouter } from './routers';
import { newLinkPage } from './pages/newLink';

export interface Env {
	DB: D1Database;
	PEPPER: string;
}

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

		return linksPage({ userEmail: user.email, request });
	})
	.all('/-/*', dashRouter.handle)
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
			// delete their session with a vengeance.
			const user = await request.userCallback(session.userId);

			if (!user) {
				await db.delete(sessions).where(eq(sessions.sessionId, session.sessionId)).run();
			}
		});

		if (link) {
			const finalString = parts.reduce((acc, part) => acc.replace('%s', part), link.destination);
			return Response.redirect(finalString, 302);
		}

		request.query['key'] = key;
		return newLinkPage({ request });
	});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const pepper = env.PEPPER;
		const db = drizzle(env.DB);
		const waitUntil = ctx.waitUntil.bind(ctx);

		return router.handle(request, { db, pepper, waitUntil }).catch(error);
	},
};
