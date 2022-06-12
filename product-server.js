const express = require('express')
const { v4: uuid } = require('uuid')

const app = express()

// Product
// - ID: UUID (String)
// - Name: String
// - Type: String
// - Price: Number
// - InStock?: Boolean

let Products = [
    {
        id: uuid(),
        name: 'ลูกข่าง',
        type: 'Toy',
        price: 20.25,
        inStock: true
    },
    {
        id: uuid(),
        name: 'ไส้กรอก',
        type: 'Food',
        price: 24.00,
        inStock: true
    }
]

app.use(express.json())

app.get('/products', (req, res) => {
    res.json(Products)
})

app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id)
    const founds = Products.filter((product) => {
        return product.id === id
    })
    if (founds.length === 0) {
        res.sendStatus(404)
    } else {
        res.json(founds[0])
    }
})

app.post('/products', (req, res) => {
    const { name, type, price, inStock } = req.body
    // const product = { 
    //     name: name,
    //     type: type,
    //     price: price,
    //     inStock: inStock
    // }
    const product = {
        id: uuid(),
        name,
        type,
        price,
        inStock
    }
    Products = [...Products, product]
    res.sendStatus(201)
})

app.delete('/products/:id', (req, res) => {
    const id = req.params.id
    Products = Products.filter((product) => {
        return product.id !== id
    })
    res.sendStatus(204)
})

app.put('/products/:id', (req, res) => {
    const id = req.params.id
    const founds = Products.filter((product) => {
        return product.id === id
    })
    if (founds.length === 0) {
        res.sendStatus(404)
        return
    }
    const { name, inStock } = req.body
    const product = { ...founds[0], name, inStock }
    const newProducts = Products.filter((product) => {
        return product.id !== id
    })
    Products = [...newProducts, product ]
    res.sendStatus(204)
})

app.listen(4444, () => {
    console.log('server started')
})
