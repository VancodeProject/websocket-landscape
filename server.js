// TODO: supprimer les sendErrors fonctions et utiliser le error endpoint
const express = require('express')
const WebSocket = require('websocket').server
const fs = require('fs')
const mysql = require('mysql')
// On charge les variable environementales depuis le fichier .env
require('dotenv').config();

// Import de nos propres modules
const { auth, account } = require('./src/js/user/user');
const jwt = require('./src/js/token/token');
const rooms = require('./src/js/user/rooms/rooms');

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
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
// Endpoint pour les pré-requête lié aux CORS
app.options('/api/*', (req, res) => res.end())
// Middleware pour parse le token sur les endpoints le nécessitant
app.use('/api/user/', (req, res, next) => {
	jwt.middleware(req,res,next)
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

	res.writeHead(200, {
		'Content-Type': 'application/json'
	})
	res.write(user)
	res.end()
})

app.patch('/api/user/account', (req, res) => {
	account.modifyAccount(req, res, db_connection)
})

app.delete('/api/user/account', (req, res) => {
	account.deleteAccount(req, res, db_connection)
})

app.get('/api/user/rooms', (req, res) => {
	rooms.retrieve(req, res, db_connection)
})

// Lancement du serveur HTTP
const port = 3000
const server = app.listen(port, '127.0.0.1', function () {
  console.log('myapp listening on port ' + port)
})

// -----------------------------------------------
// ------------------ WEBSOCKET ------------------
// -----------------------------------------------

// Lancement du serveur Websocket 
const ws = new WebSocket({
	httpServer: server,
	autoAcceptConnections: false
})

const waiting = []
const rooms = {}

// Requete de connexion
ws.on('request', (req) => {
	var connection = req.accept('code-simu', req.origin)
	console.log('New connection received. Adding to waiting queue')
	waiting.push(connection)

	connection.on('message', (msg) => {
		const infos = JSON.parse(msg.utf8Data)
		const room = rooms[infos.slang]

		console.log(`Nouveau message de la room ${infos.slang}.`)

		if (waiting.indexOf(connection) !== -1) {
			if (room) {
				room.connections.push(connection)
				connection.send(JSON.stringify({
					type: "STR",
					zones: room.zones,
					users: room.users
				}))
			} else {
				// Obligé d'utiliser rooms[slang] puisque la variable room === undefined
				rooms[infos.slang].connections = [connection]
				// TODO: Gérer la création/reprise de la salle avec la BD
			}

			waiting.splice(waiting.indexOf(connection), 1)
			return
		}

		// Si on est deja membre d'une salle alors on gere les differents event
		switch (infos.type) {
			case "TXT":
				room.zones.find((el) => el.id == infos.id).content = infos.content
				break;

			case "ACZ":
				rooms.zones.push({
					id: infos.zone.id,
					title: infos.zone.title,
					users: [],
					content: [""],
				})
				break;

			case "DCZ":
				room.zones.splice(
					room.lastIndexOf(
						room.find((el) => el.id == infos.id)
					)
				, 1)
				break;

			case "UCZ":
				room.zones[infos.index].title = infos.title;
				break;

			case "AUL":
				room.zones.find((el) => el.id == infos.idCode).users.push(infos.idUser)
				break;

			case "DUL": {
				const zone = room.zones.find((el) => el.id == infos.idCode)
				zone.users.splice(
					zone.users.lastIndexOf(infos.idUser)
				, 1)
				break;
			}

			case "RAZ":
				room.zones = []
				break;

			case "ANU": {
				const user = {
					id: infos.user.id,
					name: infos.user.name,
					status: infos.user.status
				}

				if (infos.first)
					room.users.unshift(user)
				else
					room.users.push(user)

				break;
			}
		}

		// On renvoie ensuite le message a tous les utilisateurs de la salle actuelle
		room.connections.forEach((other) => {
			if (other !== connection)
				other.send(msg)
		})
	})

	connection.on('close', (reasonCode, description) => {
		Object.entries(rooms).forEach(([slang, room]) => {
			const maybeSelf = room.connections.find((el) => el === connection)
			if (maybeSelf) {
				console.log(`Un utilisateur s'est deconnecte de la salle ${slang} avec le code ${reasonCode}: ${description}`)
				room.connections.splice(room.connections.lastIndexOf(connection), 1)
				break
			}
		})
	})
})
