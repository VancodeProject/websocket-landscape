// TODO: Check non-empty password
const md5 = require('md5')
const { ErrorCodes, ErrorWithCode } = require('../../error/error')
const sendError = require('../../utils')
const jwt = require('../../token/token')

module.exports = (req, res, db) => {
	const username = req.body.userName
	const password = req.body.password

	if (username === undefined || password === undefined)
		return sendError(res, new ErrorWithCode("There are missing credentials", ErrorCodes.CREDENTIALS_MISSING))

	const sql_query = `
	SELECT *
	FROM users
	WHERE BINARY username = ?
	LIMIT 1
	`

	db.query(
		sql_query,
		[username],
		(error, results, fields) => {
			// On fait nos tests sur les potentielles erreurs
			if (error)
				return sendError(res, new ErrorWithCode(error.message, ErrorCodes.DATABASE_ISSUE))

			if (results.length === 0)
				return sendError(res, new ErrorWithCode("There is no matching row in DB", ErrorCodes.NO_MATCHING_USERNAME))

			// Puisqu'on a précisé une limite, on n'est sûr de n'avoir
			// qu'un seul résultat
			const dbUser = results[0]

			// On vérifie que les hashs des mdp correspondent
			const hashPass = md5(password)

			if (hashPass !== dbUser.password)
				return sendError(res, new ErrorWithCode("Password doesn't match with database", ErrorCodes.PASSWORD_INCORRECT))

			// Si on est arrivé ici, alors le compte correspond à celui de la bd
			// On renvoie donc une requête 200 (OK) ainsi que le token de connexion
			const responseData = JSON.stringify(
				{
					token: jwt.create({
						userName: username,
						email: dbUser.email,
					})
				}
			)

			res.writeHead(200, {
				'Content-Type': 'application/json'
			})
			res.write(responseData)
			res.end()
		}
	)
}
