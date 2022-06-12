const jwt = require('jsonwebtoken')

const SECRET_KEY = 'shhhh!'
const TOKEN_TYPE = {
    ACCESS: 'access',
    REFRESH: 'refresh'
}

function token(data, expiresIn) {
    return jwt.sign(data, SECRET_KEY, { expiresIn })
}

function accessToken(data) {
    const payload = {
        ...data,
        type: TOKEN_TYPE.ACCESS
    }
    return token(payload, '1h')
}

function refreshToken(data) {
    const payload = {
        ...data,
        type: TOKEN_TYPE.REFRESH
    }
    return token(payload, '1h')
}

function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY)
}

module.exports = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    verifyToken: verifyToken,
    TOKEN_TYPE: TOKEN_TYPE
}