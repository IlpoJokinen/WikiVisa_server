const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const socket = require("socket.io")
const dummyData = require("./players.json")

app.use(express.static('./client/build'))

app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const io = socket(server)

io.on("connection", (socket) => {
    console.log(`socket ${socket.id} created`)
    socket.emit("dummyData", dummyData)

    socket.on("click", (data) => {
        socket.broadcast.emit("someoneClicked", data)
        socket.emit("senderConfirmation", "message sent")
    })
})