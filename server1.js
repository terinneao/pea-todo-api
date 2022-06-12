const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { validate, isString, minLength, isBool } = require('dvali')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { checkUser, secretKey } = require('./middleware')

const prisma = new PrismaClient()
const app = express()

const port = 4444

// Todo
// - ID: UUID
// - Name: String
// - Completed: Boolean

const validateName = validate([ isString(), minLength(3) ])

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
    const token = jwt.sign({
        id: found.id}, 
        secretKey, 
        {expiresIn: '20s'}
    )

    res.json({ token })
    
})

app.get('/todos', async (req, res) => {
    const todos = await prisma.todo.findMany()
    res.json(todos)
})

app.post('/todos', async (req, res) => {
    try {
        const { name } = req.body
        const validatedName = await validateName(name)
        const todo = { 
            name: validatedName, 
            completed: false 
        }
        await prisma.todo.create({
            data: todo
        })
        res.sendStatus(201)
    } catch (err) {
        console.log(err)
        res.status(422).json({
            message: err
        })
    }
    console.log()
})

app.get('/todos/:id', async (req, res) => {
    const id = Number(req.params.id)
    const todo = await prisma.todo.findFirst({
        where: { id }
    })
    if (!todo) {
        res.sendStatus(404)
        return
    }
    res.json(todo)
})

app.delete('/todos/:id', async (req, res) => {
    const id = Number(req.params.id)
    await prisma.todo.delete({
        where: { id }
    })
    res.sendStatus(204)
})

const validateCompleted = validate([ isBool() ])

const validateUpdateTodo = validate({
    name: validateName,
    completed: validateCompleted
})

app.put('/todos/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const update = await validateUpdateTodo(req.body)
        const found = await prisma.todo.findFirst({
            where: { id }
        })
        if (!found) {
            res.sendStatus(404)
            return
        }
        await prisma.todo.update({
            data: update,
            where: { id }
        })
        res.sendStatus(204)
    } catch (err) {
        console.log(err)
        console.log(err.toString())
        res.status(422).json({
            message: err
        })
    }
}) 

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})