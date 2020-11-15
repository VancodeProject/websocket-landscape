const express = require('express')
const WebSocket = require('websocket').server
const fs = require('fs')
const mysql = require('mysql')
// On charge les variable environementales depuis le fichier .env
require('dotenv').config();

// Import de nos propres modules
const auth = require('./src/js/auth/auth');
const { jwtMiddleware } = require('./src/js/token/token');

const app = express()
const db_connection = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DATABASE
})

// Analyse le body reçut dans la requête et permet son utilisation
app.use(express.json())
// Middleware pour désactiver les CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})
// Middleware pour parse le token sur les endpoints le nécessitant
app.use('/api/user/', (req, res, next) => {
	jwtMiddleware(req,res,next)
})

// Routes
app.get('/', (req, res) => {
	fs.readFile('index.html', function(err, data){
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.write(data)
		res.end()
	})
})

app.post('/api/login', (req, res) => {
	auth.login(req, res, db_connection)
})

app.post('/api/register', (req, res) => {
	auth.register(req, res, db_connection)
})

app.get('/api/user/token_infos', (req, res) => {
	const user = JSON.stringify(req.user)

	res.write(user)
	res.end()
})

// Lancement du serveur HTTP
const port = 3000
const server = app.listen(port, '127.0.0.1', function () {
  console.log('myapp listening on port ' + port)
})

// Lancement du serveur Websocket 
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
