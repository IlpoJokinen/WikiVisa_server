const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const dummyData = require('./players.json')
const port = process.env.PORT || 3001
const { getCapitalQuestion } = require("./capitalQuestion")

app.use(express.static('./client/build'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = socket(server)
app.use(cors())

const question = getQuestion("capital")

function getQuestion(type) {
    switch(type) {
        case 'capital':
            return getCapitalQuestion()
        default: 
            console.log('No question type defined')
    }
}

io.on("connection", (socket) => { 
    socket.emit("dummyData", dummyData)
    socket.on("get question", () => {
        console.log("question", question)
        question.then(data => {
            io.emit("send question", {
                question: data.title,
                choices: data.choices
            })
        })
    })
})