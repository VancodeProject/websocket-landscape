const express = require('express')
const WebSocket = require('websocket').server
const fs = require('fs')
const DBWrapper = require('./src/js/database/MySQLWrapper.js')

const app = express()

app.get('/', (req, res) => {
	fs.readFile("index.html", function(err, data){
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.write(data)
		res.end()
	})
})

app.get('/api', (req, res) => {
	const test_valeur = {
		user: 'AlexLeBG',
		password: 'JeSuisSecret',
		token: 'hfjhHJDH6pA798uidsihiU768D7yd_kdkE'
	}

	res.send(JSON.stringify(test_valeur))
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
