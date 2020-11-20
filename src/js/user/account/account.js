const md5 = require('md5')
const sendError = require('../../utils')
const { ErrorWithCode, ErrorCodes } = require('../../error/error')
const change = require('./change')
const jwt = require('../../token/token')

module.exports = {
    modifyAccount: async (req, res, db) => {
        const username = req.body.userName
        const email = req.body.email
        const password = req.body.password && md5(req.body.password)
        const npassword = req.body.newpassword && md5(req.body.newpassword)
        const nrpassword = req.body.newpasswordRepeat && md5(req.body.newpasswordRepeat)

        console.log(req.user)
        console.log(username)

        try {
            if (username && username !== req.user.userName)
                await change(db, {
                    query: `
                    UPDATE users
                    SET username = ?
                    WHERE username = ? AND email = ?`,
                    values: [
                        username,
                        req.user.userName,
                        req.user.email
                    ],
                    errorCode: ErrorCodes.USERNAME_DUPLICATE,
                })

            if (email && email !== req.user.email)
                await change(db, {
                    query: `
                    UPDATE users
                    SET email = ?
                    WHERE username = ? AND email = ?`,
                    values: [
                        email,
                        req.user.userName,
                        req.user.email
                    ],
                    errorCode: ErrorCodes.EMAIL_DUPLICATE,
                })

            if (password && npassword && nrpassword)
                if (nrpassword !== npassword)
                    throw new ErrorWithCode("Password and repeat doesn't correspond", ErrorCodes.PASSWORD_REPEAT)
                
                if (password !== npassword)
                    await change(db, {
                        query: `
                        UPDATE users
                        SET password = ?
                        WHERE password = ? AND username = ? AND email = ?`,
                        values: [
                            npassword,
                            password,
                            req.user.userName,
                            req.user.email
                        ],
                    })
        } catch(error) {
            return sendError(res, error)
        }

        const newToken = JSON.stringify({
            token: jwt.create({
                userName: username,
                email: email
            })
        })
        res.writeHead(200, {
            'Content-Type':'application/json'
        })
        res.write(newToken)
        res.end()
    },
    deleteAccount: (req, res, db) => {
       const sql_query = `` 
    }
}