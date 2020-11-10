const md5 = require('md5')
const { ErrorCodes, ErrorWithCode } = require('../error/error.js')

module.exports = (req, res, db) => {
	const username = req.body.userName
	const password = req.body.password

	db.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username],
		(error, results, fields) => {
			try {
				// On fait nos tests sur les potentielles erreurs
				if (error) throw error
				if (results.length === 0) throw new Error("No username match")
				if (username === undefined || password === undefined) throw new Error("Data wasn't received")
				
				// Puisqu'on a précisé une limite, on n'est sûr de n'avoir
				// qu'un seul résultat
				const dbUser = results[0]

				// On vérifie que les hashs des mdp correspondent
				const hashPass = md5(password)

				if (hashPass !== dbUser.password) throw new ErrorWithCode("Password doesn't match with database", ErrorCodes.PASSWORD_INCORRECT)

				// Si on est arrivé ici, alors le compte correspond à celui de la bd
				// On renvoie donc une requête 200 (OK) ainsi que le token de connexion
				const responseData = JSON.stringify(
					{
						token: "fjjijjfkdju8YC8CHHCO_d_hcO98CI"
					}
				)

				res.writeHead(200, {'Content-Type': 'application/json'})
				res.write(responseData)

			} catch(error) {
				// On arrive ici si une erreur a été renvoyée (throw)
				// On envoie l'erreur à la FE
				const errorData = JSON.stringify(error)

				res.writeHead(400, {'Content-Type': 'application/json'})
				res.write(errorData)

			} finally {
				// Quoiqu'il arrive on doit terminer la requête
				res.end()
			}
		}
	)
}
