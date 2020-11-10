// TODO: regex email, password and check for empty strings
const { ErrorCodes, ErrorWithCode } = require('../error/error.js')
const md5 = require('md5')

module.exports = (req, res, db) => {
	const username = req.body.userName
	const email = req.body.email
	const password = req.body.password

	try {
		if (username === undefined || password === undefined || email === undefined) throw new ErrorWithCode("There are missing credentials", ErrorCodes.CREDENTIALS_MISSING)

		db.query('INSERT INTO users(username, email, password) VALUES (?, ?, ?);', [username, email, md5(password)], (error, result, fields) => {
			if (error) console.log(error)

			if (result.affectedRows !== 1) throw new ErrorWithCode("New user wasn't inserted", ErrorCodes.INSERT_PROBLEM)
		})
		
		res.writeHead(200)
	} catch(error) {
		// On arrive ici si une erreur a été renvoyée (throw)
		// On envoie l'erreur à la FE
		const errorData = JSON.stringify(error)

		res.writeHead(400, {'Content-Type': 'application/json'})
		res.write(errorData)

	} finally {
		res.end()

	}

}
