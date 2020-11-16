const { ErrorCodes, ErrorWithCode } = require('../../error/error')
const sendError = require('../utils')

module.exports = (res, db, infos) => {
    db.query(
        infos.query,
        [infos.values],
        (error, result, fields) => {
            if (error) {
                if (error.errno !== 1062)
                    return sendError(res, new ErrorWithCode(error.sqlMessage, ErrorCodes.DATABASE_ISSUE))
                
                sendError(res, new ErrorWithCode(error.sqlMessage, infos.errorCode))
            }
        }
    )
}