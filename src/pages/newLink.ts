import { IRequest, html as htmlResponse } from 'itty-router';
import { baseHtml } from './base';
import { Link } from '../schema';
const html = String.raw;

export const newLinkPage = ({ request }: { request: IRequest }) => {
	const { key } = request.query;

	const template = html`
		<h1>New Link</h1>
		<form action="/-/api/links" method="POST" autocomplete="off">
			<label for="name">Name</label>
			<input type="text" name="name" id="name" autofocus />
			<label for="key">Key</label>
			<input type="text" name="key" id="key" ${key ? `value=${key}` : ''} />
			<label for="destination">Destination</label>
			<input type="text" name="destination" id="destination" />
			<button type="submit">Create</button>
		</form>
	`;

	return baseHtml({ request, template });
};
