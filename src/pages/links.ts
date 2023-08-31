import { IRequest, html as htmlResponse } from 'itty-router';

const html = String.raw;

export const linksPage = ({ request, userEmail }: { request: IRequest; userEmail: string }) => {
	const colo = request.cf?.colo;

	const template = html`
		<html>
			<head>
				<link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
			</head>

			<script src="//unpkg.com/alpinejs" defer></script>
			<script>
				const logout = async () => {
					await fetch('/-/auth/logout', {
						method: 'POST',
					});
					window.location.reload();
				};

				const fetchCodes = async () => {
					return fetch('/-/api/invite_codes')
						.then((res) => res.json())
						.then((x) => x.codes);
				};

				const fetchLinks = async () => {
					return fetch('/-/api/links')
						.then((res) => res.json())
						.then((x) => x.links);
				};
			</script>
			<h1>Warp Links</h1>
			<p x-data="{}">Welcome, ${userEmail} <button @click="await logout()">Logout</button></p>
			<h2>Links</h2>
			<a href="/-/ui/links/new">New Link</a>
			<table class="table-auto" x-data="{ links: [] }" x-init="links = await fetchLinks()">
				<thead>
					<tr>
						<th>Name</th>
						<th>Key</th>
						<th>Destination</th>
					</tr>
				</thead>
				<tbody>
					<template x-for="link in links" :key="link.id">
						<tr>
							<td x-text="link.name"></td>
							<td x-text="link.key"></td>
							<td x-text="link.destination"></td>
						</tr>
					</template>
				</tbody>
			</table>
			<h2>Invite Codes</h2>
			<table class="table-auto" x-data="{ codes: [] }" x-init="codes = await fetchCodes()">
				<thead>
					<tr>
						<th>Code</th>
						<th>Active</th>
					</tr>
				</thead>
				<tbody>
					<template x-for="code in codes" :key="code.id">
						<tr>
							<td x-text="code.code"></td>
							<td x-text="code.active"></td>
						</tr>
					</template>
				</tbody>
			</table>
			<hr />
		</html>
	`;

	return htmlResponse(template);
};
