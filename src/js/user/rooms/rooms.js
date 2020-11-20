const { ErrorWithCode, ErrorCodes } = require("../../error/error")
const sendError = require('../../utils')

module.exports = {
    retrieve: async (req, res, db) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(
                `
                SELECT r.*, l.name
                FROM users AS u
                INNER JOIN rooms r
                INNER JOIN languages l
                ON r.master_id = u.id AND r.language_id = l.id
                WHERE u.username = ? AND u.email = ?
                `,
               [
                   req.user.userName,
                   req.user.email
                ],
                (error, results) => {
                    if (error)
                        return reject(new ErrorWithCode(error.sqlMessage, ErrorCodes.DATABASE_ISSUE))
                    
                    resolve(results)
                })
            })

            const jsonResults = JSON.stringify(results)

            res.writeHead(200, {
                'Content-Type': 'application/json'
            })
            res.write(jsonResults)
            res.end()

        } catch(error) {
            sendError(res, error)

        }
    }
}