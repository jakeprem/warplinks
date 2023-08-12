// there might be a better/faster way to do this
export const extractSessionId = (request: Request) => {
	return request.headers
		.get('cookie')
		?.split(';')
		.find((c) => c.startsWith('sessionId='))
		?.split('=')[1];
};
