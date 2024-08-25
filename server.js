const express = require('express');
const app = express()
// require('dotenv').config()

const bodyParser = require('body-parser');
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const PORT = process.env.PORT || 3000   
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})