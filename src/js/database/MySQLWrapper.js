const mysql = require('mysql')

class MySQLWrapper {
	constructor(connectionObject) {
		this.connection = mysql.createConnection(connectionObject)
	}

	connect(callback) {
		if (callback === undefined) {
			callback = (err) => {
				if (err) throw err

				console.log("Connected")
			}
		}

		this.connection.connect(callback)
	}

	disconnect(callback) {
		if (callback === undefined) {
			callback = (err) => {
				if (err) throw err

				console.log("Disconnected")
			}
		}

		this.connection.end(callback)
	}

	select() {

	}

	create() {

	}

	update() {

	}
}

module.exports = MySQLWrapper
