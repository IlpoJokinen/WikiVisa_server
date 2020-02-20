const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const players = []
const port = process.env.PORT || 3001
const { getCapitalQuestion } = require("./capitalQuestion")
const games = []

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

function createGame() {
    games.push({startGameCounter: 2000, question: question})
    setInterval(() => {
        games[0] = {...games[0], startGameCounter: games[0].startGameCounter - 1}
        io.emit("send timer", games[0].startGameCounter)
    }, 1000)
}


io.on("connection", (socket) => { 
    
    socket.on("get question", () => {
        console.log("question", question)
        question.then(data => {
            io.emit("send question", {
                question: data.title,
                choices: data.choices
            })
        })
    })
    socket.on("join game", (data) => {
        if(!games.length){
            createGame() 

        }
        console.log(data)
        players.push({
            id: socket.id,  
            gamertag: data.gamertag,
            answers: [],
            points: 200
        })
     
        
        io.emit("send players", players)
        socket.emit("send game", games[0])
    })
    socket.on("get players", () => {
        console.log("here")
        socket.emit("send players", players)
    })
    
})