const jwt = require('jsonwebtoken')

const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt
    try {
        if (token) {
            jwt.verify(token, 'principal secret', (err, decodedToken) => {
                if (err) {
                    console.log(err.message)
                } else {
                    console.log(decodedToken)
                    next()
                }
            })
        } else {
            res.redirect('/dashboard')
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const verifyToken = async (req, res) => {
    const token = req.params.token
    try {
        if (token) {
            jwt.verify(token, 'principal secret', (err, decodedToken) => {
                if (err) {
                    //console.log(err.message)
                    res.json({ message: "Authentication denied" })
                } else {
                    //console.log(decodedToken)
                    res.json({ decodedToken })
                }
            })
        } else {
            res.json({ message: "Authentication denied" })
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { requireAuth, verifyToken }