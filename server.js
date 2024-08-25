const express = require('express');
const app = express()
require('dotenv').config()
const db = require('./db')
const bodyParser = require('body-parser');
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const userRoutes = require('./routes/userRoutes')
app.use('/user', userRoutes)

const candidateRoutes = require('./routes/candidateRoutes')
app.use('/candidate', candidateRoutes)

const PORT = process.env.PORT || 3000   
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
