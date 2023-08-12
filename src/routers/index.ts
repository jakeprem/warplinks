import { Router } from 'itty-router';
import { authRouter } from './authRouter';
import { apiRouter } from './apiRouter';
import { withRequireUser } from '../authMiddleware';
import { uiRouter } from './uiRouter';

export const dashRouter = Router({ base: '/-' });

dashRouter
	.all('/auth/*', authRouter.handle)
	.all('/api/*', withRequireUser, apiRouter.handle)
	.all('/ui/*', withRequireUser, uiRouter.handle)
	.all('*', async (request, extra) => {
		return new Response('no dash route here', { status: 404 });
	});
