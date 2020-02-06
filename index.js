const express = require('express')
const app = express()
const port = process.env.PORT || 3001

app.use(express.static('./client/build'))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))