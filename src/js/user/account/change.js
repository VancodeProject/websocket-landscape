const { ErrorCodes, ErrorWithCode } = require('../../error/error')
const sendError = require('../../utils')

module.exports = (db, infos) => {
    return new Promise((resolve, reject) => {
        const query = db.query(
            infos.query,
            infos.values,
            (error, okPacket) => {
                if (error){
                    const err = new ErrorWithCode(error.sqlMessage, error.errno)
                    return reject(err)
                }

                // On ajoute ce if pour prevenir des mots de passe invalide
                if (okPacket.affectedRows === 0)
                    reject(
                        new ErrorWithCode(error.error.sqlMessage, ErrorCodes.PASSWORD_INCORRECT)
                    )
                
                resolve()
            }
        )
    })
}