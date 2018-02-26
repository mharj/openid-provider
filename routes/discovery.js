const etag = require('etag');
const port = process.env.PORT || '7957';
const baseUrl = process.env.baseUrl || 'http://localhost:'+port;

const discoveryData = {
	issuer: baseUrl,
	authorization_endpoint: baseUrl + '/oauth2/v1/auth',
	token_endpoint: baseUrl + '/oauth2/v1/token',
	userinfo_endpoint: baseUrl + '/oauth2/v1/userinfo',
	revocation_endpoint: baseUrl + '/oauth2/revoke',
	jwks_uri: baseUrl + '/oauth2/v1/certs',
	response_types_supported: ['code', 'token', 'id_token', 'code token', 'code id_token', 'token id_token', 'code token id_token', 'none'],
	subject_types_supported: ['public'],
	id_token_signing_alg_values_supported: ['RS256'],
	scopes_supported: ['openid', 'email', 'profile'],
	token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
	claims_supported: ['aud', 'exp', 'iat', 'iss', 'name', 'sub'],
	code_challenge_methods_supported: ['plain', 'S256'],
};

function discovery(req, res) {
	const data = JSON.stringify(discoveryData, null, 4);
	res.set('Content-Type', 'application/json');
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'ETag, Content-Type');
	res.set('Access-Control-Max-Age', '86400');
	res.set('Access-Control-Expose-Headers', 'ETag, Content-Type');
	res.set('ETag', etag(data));
	res.send(data).end();
}

module.exports = discovery;
