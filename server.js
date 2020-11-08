const express = require('express')
const WebSocket = require('websocket').server
const fs = require('fs')
const mysql = require('mysql')
const md5 = require('md5')

const app = express()
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'thomas',
	password: '10021316',
	database: 'vancode'
})

// Parse le JSON reçut sur les endpoints
app.use(express.json())

app.all('/api', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
 })

app.get('/', (req, res) => {
	fs.readFile("index.html", function(err, data){
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.write(data)
		res.end()
	})
})

app.post('/api/login', (req, res) => {
	const username = req.body.userName
	const password = req.body.password

	connection.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username],
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

				if (hashPass !== dbUser.password) throw new Error("Passwords don't match with database")

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
				// On répond à la FE avec une liste
				const errorData = JSON.stringify(
					{
						error: error
					}
				)

				res.writeHead(400, {'Content-Type': 'application/json'})
				res.write(errorData)

			} finally {
				// Quoiqu'il arrive on doit terminer la requête
				res.end()
			}
		}
	)
})

const port = process.env.PORT || 3000

const server = app.listen(port, '127.0.0.1', function () {
  console.log('myapp listening on port ' + port)
})

const ws = new WebSocket({
	httpServer: server,
	autoAcceptConnections: false
})

const cs = []
// Requete de connexion
ws.on('request', (req) => {
	var connection = req.accept('code-simu', req.origin)
	console.log('New connection received')
	cs.push(connection)

	connection.on('message', (msg) => {
		console.log(`Message received: ${msg.utf8Data}. Nombre d'utilisateurs connectés: ${cs.length}`)
		cs.forEach( (el) => {
			if (el !== connection) {
				el.sendUTF(msg.utf8Data)
			}
		})
	})
	connection.on('close', (reasonCode, description) => {
		console.log(`Connection closed with the following code ${reasonCode}: ${description}`)
		cs.splice(cs.indexOf(connection), 1)
	})
})
