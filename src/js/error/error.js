const ErrorCodes = {
	DATABASE_ISSUE: 0,
	NO_MATCHING_USERNAME: 1,
	CREDENTIALS_MISSING: 2,
	PASSWORD_INCORRECT: 3
}

class ErrorWithCode extends Error {
	constructor(message, code, ...args) {
		super(message, ...args)
		this.msg = message
		this.code = code
	}
}

module.exports = { ErrorCodes, ErrorWithCode }
