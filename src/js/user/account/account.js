const md5 = require('md5')
const sendError = require('../../utils')
const { ErrorWithCode, ErrorCodes } = require('../../error/error')
const change = require('./change')

module.exports = {
    modifyAccount: async (req, res, db) => {
        const username = req.body.userName
        const email = req.body.email
        const password = req.body.password && md5(req.body.password)
        const npassword = req.body.newpassword && md5(req.body.newpassword)
        const nrpassword = req.body.newpasswordRepeat && md5(req.body.newpasswordRepeat)

        try {
            if (username && username !== req.user.username)
                await change(res, db, {
                    query: `
                    UPDATE users
                    SET username = ?
                    WHERE username = ? AND email = ?`,
                    values: [
                        username,
                        req.user.username,
                        req.user.email
                    ],
                    errorCode: ErrorCodes.USERNAME_DUPLICATE,
                })

            if (email && email !== req.user.email)
                await change(res, db, {
                    query: `
                    UPDATE users
                    SET email = ?
                    WHERE username = ? AND email = ?`,
                    values: [
                        email,
                        req.user.username,
                        req.user.email
                    ],
                    errorCode: ErrorCodes.EMAIL_DUPLICATE,
                })

            if (password && npassword && nrpassword)
                if (nrpassword !== npassword)
                    throw new ErrorWithCode("Password and repeat doesn't correspond", ErrorCodes.PASSWORD_REPEAT)
                
                if (password !== npassword)
                    await change(res, db, {
                        query: `
                        UPDATE users
                        SET password = ?
                        WHERE password = ? AND username = ? AND email = ?`,
                        values: [
                            npassword,
                            password,
                            req.user.username,
                            req.user.email
                        ],
                    })
        } catch(error) {
            return sendError(res, error)
        }

        res.sendStatus(200)
        res.end()
    },
    deleteAccount: (req, res, db) => {
       const sql_query = `` 
    }
}