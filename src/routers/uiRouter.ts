import { Router, json } from 'itty-router';
import { links } from '../schema';
import { linksPage } from '../pages/staticLinks';
import { newLinkPage } from '../pages/newLink';

export const uiRouter = Router({ base: '/-/ui' });

uiRouter
	.get('/links', async (request, extra) => {
		const { db } = extra;

		const allLinks = await db.select().from(links).all();

		return linksPage({ request, links: allLinks });
	})
	.get('/links/new', async (request, extra) => {
		return newLinkPage({ request });
	});
