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
    games.push({
        startGameCounter: 20, 
        question: question, 
        questionCounter: 20, 
        roundEndCounter: 20, 
        view: "startGame"
    })
    const GameCounter = setInterval(() => {
        games[0] = {...games[0], startGameCounter: games[0].startGameCounter - 1}
        io.emit("send startTimer", games[0].startGameCounter)
        if (games[0].startGameCounter <= 0) {
            games[0] = {...games[0], questionCounter: games[0].questionCounter - 1}
            io.emit("send questionTimer", games[0].questionCounter)
        }
        if (games[0].questionCounter <= 0) {
            games[0] = {...games[0], roundEndCounter: games[0].roundEndCounter - 1}
            io.emit("send roundEndTimer", games[0].roundEndCounter)
        } 
        if (games[0].roundEndCounter <= -2) {
            clearInterval(GameCounter)
        } 
    }, 1000)
} 


io.on("connection", (socket) => { 
    
    socket.on("get question", () => {
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
        players.push({
            id: socket.id,  
            gamertag: data.gamertag,
            answers: [],
            points: 0
        })
        io.emit("send players", players)
        socket.emit("send game", games)
    })
    socket.on("get players", () => {
        socket.emit("send players", players)
    })
    
})