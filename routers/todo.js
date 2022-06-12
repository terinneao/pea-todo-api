const express = require('express')
const { validate, isString, minLength, isBool } = require('dvali')

module.exports = function(prisma) {
    const validateName = validate([ isString(), minLength(3) ])
    const validateCompleted = validate([ isBool() ])
    const validateUpdateTodo = validate({
        name: validateName,
        completed: validateCompleted
    })

    const router = express.Router()

    router.get('/', async (req, res) => {
        const todos = await prisma.todo.findMany()
        res.json(todos)
    })

    router.post('/', async (req, res) => {
        try {
            const { name } = req.body
            const validatedName = await validateName(name)
            const todo = { 
                name: validatedName, 
                completed: false 
            }
            await prisma.todo.create({
                data: {
                    ...todo,
                    userId: req.User.id
                }
            })
            res.sendStatus(201)
        } catch (err) {
            console.log(err)
            res.status(422).json({
                message: err
            })
        }
    })

    router.get('/:id', async (req, res) => {
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

    router.delete('/:id', async (req, res) => {
        const id = Number(req.params.id)
        await prisma.todo.delete({
            where: { id }
        })
        res.sendStatus(204)
    })

    router.put('/:id', async (req, res) => {
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

    return router
}