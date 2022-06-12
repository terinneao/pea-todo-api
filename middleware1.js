const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const secretKey = 'shhhh!'

const prisma = new PrismaClient()

async function checkUser(req, res, next) {
    try {
        const auth = req.headers['authorization']
        if (!auth) {
            res.sendStatus(401)
            return
        }

        const token = auth.slice('Bearer: '.length).trim()
        if (!token) {
            res.sendStatus(401)
            return
        }
        
        const data = jwt.verify(token, secretKey)
        const user = await prisma.user.findFirst({
            where: { 
                id: data.id 
            }
        })

        if (!user) {
            res.sendStatus(401)
            return
        }

        req.User = user

        next()
    } catch (err) {
        console.error(err)
        res.sendStatus(401)
    }
}

module.exports = {
    checkUser: checkUser,
    secretKey
}