// TODO: Check non-empty password
const md5 = require('md5')
const { ErrorCodes, ErrorWithCode } = require('../error/error.js')
const sendError = require('./utils')

module.exports = (req, res, db) => {
	const username = req.body.userName
	const password = req.body.password

	if (username === undefined || password === undefined) {
		sendError(res, new ErrorWithCode("There are missing credentials", ErrorCodes.CREDENTIALS_MISSING))
		return
	}

	const sql_query = `
	SELECT *
	FROM users
	WHERE BINARY username = ?
	LIMIT 1`

	db.query(
		sql_query,
		[username],
		(error, results, fields) => {
			// On fait nos tests sur les potentielles erreurs
			if (error) {
				sendError(res, new ErrorWithCode(error.message, ErrorCodes.DATABASE_ISSUE))
				return
			}
			if (results.length === 0) {
				sendError(res, new ErrorWithCode("There is no matching row in DB", ErrorCodes.NO_MATCHING_USERNAME))
				return
			}
			// Puisqu'on a précisé une limite, on n'est sûr de n'avoir
			// qu'un seul résultat
			const dbUser = results[0]

			// On vérifie que les hashs des mdp correspondent
			const hashPass = md5(password)

			if (hashPass !== dbUser.password) {
				sendError(res, new ErrorWithCode("Password doesn't match with database", ErrorCodes.PASSWORD_INCORRECT))
				return
			}

			// Si on est arrivé ici, alors le compte correspond à celui de la bd
			// On renvoie donc une requête 200 (OK) ainsi que le token de connexion
			const responseData = JSON.stringify(
				{
					token: "fjjijjfkdju8YC8CHHCO_d_hcO98CI"
				}
			)

			res.writeHead(200, {'Content-Type': 'application/json'})
			res.write(responseData)
			res.end()
		}
	)
}
