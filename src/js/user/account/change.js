const { ErrorCodes, ErrorWithCode } = require('../../error/error')
const sendError = require('../../utils')

module.exports = (res, db, infos) => {
    return new Promise((resolve, reject) => {
        const query = db.query(
            infos.query,
            infos.values,
            (error) => {
                let err
                if (error) {
                    if (error.errno !== 1062)
                        err = new ErrorWithCode(error.sqlMessage, ErrorCodes.DATABASE_ISSUE)
                    
                    return reject(
                        err
                        ||
                        new ErrorWithCode(error.sqlMessage, infos.errorCode)
                    )
                }
                resolve()
            }
        )
    })
}