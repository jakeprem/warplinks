import { html as htmlResponse } from 'itty-router';

const html = String.raw;

export const loginPage = () => {
	const template = html`
		<html>
			<head>
				<link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
			</head>
			<body>
				<script src="//unpkg.com/alpinejs" defer></script>
				<script>
					const doPost = async (url, data) => {
						return fetch(url, {
							method: 'POST',
							body: JSON.stringify(data),
							headers: {
								'Content-Type': 'application/json',
							},
						});
					};

					const register = async (data) => {
						doPost('/-/register', data).then(async (res) => {
							console.log(res);
							if (res.status === 301) {
								if (res.headers.get('location') === window.location.href) {
									window.location.reload();
								} else {
									window.location.href = res.headers.get('location');
								}
							}

							if (res.status >= 400 && res.status < 500) {
								const body = await res.json();
								alert(body.error);
							}
						});
					};

					const login = async (email, password) => {
						doPost('/-/login', {
							email,
							password,
						}).then(async (res) => {
							console.log(res);
							if (res.status === 200) {
								window.location.reload();
							}

							if (res.status >= 400 && res.status < 500) {
								const body = await res.json();
								alert(body.error);
							}
						});
					};
				</script>
				<h1>Yeet Links</h1>
				<h2>Login</h2>
				<div x-data="{ email: '', password: '' }">
					<input type="email" x-model="email" placeholder="email" />
					<input type="password" x-model="password" placeholder="password" />

					<button @click="await login(email, password)">Login</button>
				</div>
				<h2>Register</h2>
				<div x-data="{ email: '', password: '', passwordVerify: '', inviteCode: '' }">
					<label for="registerEmail">Email</label>
					<input id="register-email" type="email" x-model="email" placeholder="email" />
					<label for="registerPassword">Password</label>
					<input id="registerPassword" type="password" x-model="password" placeholder="password" />
					<input type="password" x-model="passwordVerify" placeholder="verify password" />
					<label for="register-inviteCode">Invite Code</label>
					<input id="register-inviteCode" type="text" x-model="inviteCode" placeholder="invite code" />
					<button @click="await register({email, password, passwordVerify, inviteCode})">Register</button>
				</div>
				<hr />
				<hr />
			</body>
		</html>
	`;

	return htmlResponse(template);
};
