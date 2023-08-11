import { html as htmlResponse } from 'itty-router';

const html = String.raw;

export const linksPage = ({ userEmail }: { userEmail: string }) => {
	const template = html`
		<html>
			<head>
				<link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
			</head>

			<script src="//unpkg.com/alpinejs" defer></script>
			<script>
				const logout = async () => {
					await fetch('/-/logout', {
						method: 'POST',
					});
					window.location.reload();
				};

				const fetchCodes = async () => {
					return fetch('/-/invite_codes')
						.then((res) => res.json())
						.then((x) => x.codes);
				};
			</script>
			<h1>Yeet Links</h1>
			<p x-data="{}">Welcome, ${userEmail} <button @click="await logout()">Logout</button></p>
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
