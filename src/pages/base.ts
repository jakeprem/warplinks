import { html as htmlResponse } from 'itty-router';
const html = String.raw;

export const baseHtml = ({ request, template }) => {
	const colo = request.cf?.colo;

	const content = html`
		<html>
			<head>
				<title>Warp Links${colo && ` (${colo})`}</title>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" />
				<script src="//unpkg.com/alpinejs" defer></script>
			</head>
			<body style="max-width:80%;margin-left:auto;margin-right:auto;">
				<nav style="display:flex;flex-direction:row;justify-content:space-around;">
					<!-- <a href="/">Home</a> -->
					<p>Region: ${colo}</p>
					<a href="/-/ui/links">Links</a>
					<!-- <a href="/-/ui/invite_codes">Invite Codes</a> -->
				</nav>
				${template}
			</body>
		</html>
	`;

	return htmlResponse(content);
};
