// TODO: regex email, password and check for empty strings
const md5 = require('md5')
const { ErrorCodes, ErrorWithCode } = require('../error/error')
const { createJWT } = require('../token/token')
const sendError = require('./utils')

module.exports = async (req, res, db) => {
	const username = req.body.userName
	const email = req.body.email
	const password = req.body.password

	if (username === undefined || password === undefined || email === undefined) {
		sendError(res, new ErrorWithCode("There are missing credentials", ErrorCodes.CREDENTIALS_MISSING))
		return
	}

	const sql_query = `
	INSERT INTO 
		users(username, email, password)
		VALUES (?, ?, ?);
	`
	db.query(
		sql_query,
		[username, email, md5(password)],
		(error, result, fields) => {
			if (error) {
				if (error.errno !== 1062) {
					sendError(res, new ErrorWithCode(error.sqlMessage, ErrorCodes.DATABASE_ISSUE))
					return
				}

				const code = error.sqlMessage.search('email') == -1
					? // Si search renvoie -1, ça veut dire que l'username est le doublon
					ErrorCodes.USERNAME_DUPLICATE 
					: // Sinon c'est l'email le doublon
					ErrorCodes.EMAIL_DUPLICATE

				sendError(res, new ErrorWithCode(error.sqlMessage, code))
				return
			}

			if (result.affectedRows !== 1) {
				sendError(res, new ErrorWithCode("New user wasn't inserted", ErrorCodes.INSERT_PROBLEM))
				return
			}

			const data = JSON.stringify({
				token: createJWT({
					username: username,
					email: email,
				})
			})

			res.writeHead(200, {'Content-Type': 'application/json'})
			res.write(data)
			res.end()
		}
	)
}
