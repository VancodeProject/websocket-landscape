// TODO: regex email, password and check for empty strings
const md5 = require('md5')
const { ErrorCodes, ErrorWithCode } = require('../error/error.js')
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

				sendError(res, new ErrorWithCode(error.sqlMessage, ErrorCodes.DUPLICATE_DATABASE))
				return
			}

			if (result.affectedRows !== 1) {
				sendError(res, new ErrorWithCode("New user wasn't inserted", ErrorCodes.INSERT_PROBLEM))
				return
			}

			const data = JSON.stringify({
				token: "alexandre_est_trop_beau"
			})

			res.writeHead(200, {'Content-Type': 'application/json'})
			res.write(data)
			res.end()
		}
	)
}
