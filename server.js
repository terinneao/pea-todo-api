const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const { checkUser } = require('./middleware')
const { refreshToken, accessToken, verifyToken, TOKEN_TYPE } = require('./token')
const todoRouter = require('./routers/todo')

const prisma = new PrismaClient()
const app = express()

const port = 4444

// Todo
// - ID: UUID
// - Name: String
// - Completed: Boolean

app.use(express.json())

// Todo
// - create register api
// - create login api
// - add route protect

// Encode -> แปลงรูป -> Decode
// Encrypt -> แปลงรูป + key -> Decrypt
// Hash -> แปลงรูป + key

// ehud secret! $2b$10$/oPVecF6opjIaeKyunWxRu6g3pPs8oIdEhx5H.sls.Ur2J.Zc9QJm
// ehud secret! $2b$10$gOCXXso37L4zv7TeS99jkO4UE5lA12CAlqkKao1FAU.TB/qRZpPKe

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const passwordHashed = await bcrypt.hash(password, 10)
    await prisma.user.create({
        data: {
            username,
            password: passwordHashed
        }
    })
    res.sendStatus(201)
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const found = await prisma.user.findFirst({
        where: { username }
    })
    if (!found) {
        res.sendStatus(401)
        return
    }
    const valid = await bcrypt.compare(password, found.password)
    if (!valid) {
        res.sendStatus(401)
        return
    }

    const _refreshToken = refreshToken()
    await prisma.user.update({
        data: { 
            token: _refreshToken
        },
        where: {
            id: found.id
        }
    })

    res.json({ 
        refreshToken: _refreshToken,
        accessToken: accessToken()
     })
})

app.post('/refresh', async (req, res) => {
    const { token } = req.body
    try {
        const data = verifyToken(token)
        if (data.type !== TOKEN_TYPE.REFRESH) {
            res.sendStatus(401)
            return
        }

        const found = await prisma.user.findFirst({
            where: {
                token: token
            }
        })
        if (!found) {
            res.sendStatus(401)
            return
        }

        res.json({
            accessToken: accessToken()
        })
    } catch (err) {
        console.error(err)
        res.sendStatus(401)
    }
})

app.use('/todos', checkUser, todoRouter(prisma))

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})
