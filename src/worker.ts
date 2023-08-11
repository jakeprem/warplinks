import { error, html, json, Router, withContent } from 'itty-router';
import { hash, verify } from './passwordHasher';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

// Routes we need:
// - POST /-/login

const router = Router();
router
	.get('/', async (request, ...args) => {
		return html`
			<script src="//unpkg.com/alpinejs" defer></script>
			<div x-data="{ open: false }">
				    <button @click="open = !open">Expand</button>

				    <span x-show="open">
				        Content...
				    </span>
				</div>
			</script>
		`;
	})
	.post('/-/login', withContent, async (request) => {
		const verified = await verify({
			hash: request.content.hashedPassword,
			password: request.content.password,
			pepper: 'pepper',
		});

		return { verified };
	})
	.post('/-/register', withContent, async (request) => {
		const hashedPassword = await hash({ password: request.content.password, pepper: 'pepper' });

		return { hashedPassword };
	})
	.post('/-/logout', async (request) => {
		return html`<h1>Logout</h1>`;
	})
	.get('*', async (request) => {
		return `This is where the golink would go: ${request.url}`;
	});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, 'hi').then(json).catch(error);
	},
};
