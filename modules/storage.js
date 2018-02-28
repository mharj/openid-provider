let sessionStorage = null;

module.exports.setSessionStorage = (storage) => {
	sessionStorage = storage;
};
module.exports.getSessionStorage = (storage) => {
	return sessionStorage;
};
