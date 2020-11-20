const md5 = require('md5')
const sendError = require('../../utils')
const { ErrorWithCode, ErrorCodes } = require('../../error/error')
const change = require('./change')
const jwt = require('../../token/token')

// Fonctions de changement non exportées
const updateProfil = async (db, username, email, tokenUser) => {
    await change(db, {
        query: `
        UPDATE users
        SET username = ?, email = ?
        WHERE username = ? AND email = ?`,
        values: [
            username,
            email,
            tokenUser.userName,
            tokenUser.email
        ],
    }).catch((err) => {
        if (err.code === 1062) {
            if (err.msg.search('email') !== -1)
                throw new ErrorWithCode(err.msg, ErrorCodes.EMAIL_DUPLICATE)

            throw new ErrorWithCode(err.msg, ErrorCodes.USERNAME_DUPLICATE)
        }

        throw new ErrorWithCode(err.msg, ErrorCodes.DATABASE_ISSUE)
    })
}

const passwordChange = async (db, password, npassword, nrpassword, tokenUser) => {
    await change(db, {
        query: `
        UPDATE users
        SET password = ?
        WHERE password = ? AND username = ? AND email = ?`,
        values: [
            npassword,
            password,
            tokenUser.userName,
            tokenUser.email
        ],
    }).catch((err) => {
        throw new ErrorWithCode(err.msg, ErrorCodes.DATABASE_ISSUE)
    })
}

module.exports = {
    modifyAccount: async (req, res, db) => {
        const username = req.body.userName
        const email = req.body.email
        const password = req.body.password && md5(req.body.password)
        const npassword = req.body.newpassword && md5(req.body.newpassword)
        const nrpassword = req.body.newpasswordRepeat && md5(req.body.newpasswordRepeat)

        try {
            if (username && email)
                await updateProfil(db, username, email, req.user)

            if (password && npassword && nrpassword && password !== npassword)
                await passwordChange(db, password, npassword, nrpassword, req.user)            

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