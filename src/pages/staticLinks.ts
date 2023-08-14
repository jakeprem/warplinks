import { IRequest, html as htmlResponse } from 'itty-router';
import { baseHtml } from './base';
import { Link } from '../schema';
const html = String.raw;

export const linksPage = ({ request, links }: { request: IRequest; links: Link[] }) => {
	const template = html`
		<h1>Links</h1>
		<script>
			const allLinks = ${JSON.stringify(links)};
		</script>
		<table x-data="{ links: allLinks }">
			<thead>
				<tr>
					<th>Name</th>
					<th>Key</th>
					<th>Destination</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<template x-for="link in links" :key="link.id">
					<tr>
						<td x-text="link.name"></td>
						<td x-text="link.key"></td>
						<td x-text="link.destination"></td>
						<td style="display:flex;flex-direction:row;justify-content:space-evenly;">
							<button style="width:35%;">Edit</button>
							<button style="width:35%;">Delete</button>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
	`;

	return baseHtml({ request, template });
};
