const jwt = require('jsonwebtoken')

module.exports = {
    jwtMiddleware: (req, res, next) => {
        const token = req.headers.authorization

        if (!token)
            return res.sendStatus(401)
        
        jwt.verify(
            token,
            process.env.SECRET, 
            (error, user) => {
                if (error)
                    return res.sendStatus(403)

                req.user = user
            }
        )

        next()
    },
    createJWT: (infos) => {
        return jwt.sign(infos, process.env.SECRET)
    }
}