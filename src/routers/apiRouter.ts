import { Router, json, withContent } from 'itty-router';
import { withRequireUser } from '../authMiddleware';
import { inviteCodes, links } from '../schema';
import { linksPage } from '../pages/staticLinks';

const apiRouter = Router({ base: '/-/api' });

apiRouter
	.get('/invite_codes', async (request, extra) => {
		const { db } = extra;

		if (!request.user) {
			// the middleware should prevent this, but i feel better having it here for now
			console.error('no user, but there should be here');
			return json({ error: 'not logged in' }, { status: 400 });
		}

		const codes = await db.select().from(inviteCodes).all();

		return json({ codes });
	})
	.get('/links', async (request, extra) => {
		const { db } = extra;

		if (!request.user) {
			// the middleware should prevent this, but i feel better having it here for now
			console.error('no user, but there should be here');
			return json({ error: 'not logged in' }, { status: 400 });
		}

		const allLinks = await db.select().from(links).all();

		return json({ links: allLinks });
	})
	.post('/links', async (request, extra) => {
		const { db } = extra;
		const formData = await request.formData();

		let data = { name: '', key: '', destination: '' };
		for (const [key, value] of formData.entries()) {
			data[key] = value;
		}

		const { name, key, destination } = data;

		if (!name || !key || !destination) {
			return new Response('missing name, key, or destination', { status: 400 });
		}

		const newLink = { name, key, destination };

		const res = await db.insert(links).values(newLink).run();

		if (res.success) {
			return linksPage({ request, links: [newLink] });
		}

		console.log(newLink);
	})
	.all('*', async (request, extra) => {
		return json({ message: 'no api route here' }, { status: 404 });
	});

export { apiRouter };
