const md5 = require('md5')
const { ErrorWithCode, ErrorCodes } = require('../../error/error')
const change = require('./change')

module.exports = {
    modifyAccount: (req, res, db) => {
        const username = req.body.userName
        const email = req.body.email
        const password = md5(req.body.password)
        const npassword = md5(req.body.newpassword)
        const nrpassword = md5(req.body.newpasswordRepeat)

        if (username && username !== req.user.username)
            change(res, db, {
                query: ``,
                values: [username],
                errorCode: ErrorCodes.USERNAME_DUPLICATE,
            })

        if (email && email !== req.user.email)
            change(res, db, {
                query: ``,
                values: [],
                errorCode: ErrorCodes.EMAIL_DUPLICATE,
            })

        if (password && npassword && nrpassword)
            if (nrpassword !== npassword)
                return sendError(res, new ErrorWithCode("Password and repeat doesn't correspond", ErrorCodes.PASSWORD_REPEAT))
            
            if (password !== npassword)
                change(res, db, {
                    query: ``,
                    values: [],
                })

        res.sendStatus(200)
        res.end()
    },
    deleteAccount: (req, res, db) => {
       const sql_query = `` 
    }
}