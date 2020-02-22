const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const port = process.env.PORT || 3001
const { getNationalCapitalsOfCountries } = require("./capitalQuestion")
const games = []
const players = []
let game_id = 0
let question_id = 0

app.use(express.static('./client/build'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`WikiVisa app listening on port ${port}!`))
const io = socket(server)
app.use(cors())

function createGame() {
    return new Promise((resolve, reject) => {
        const randomizeQuestion = getQuestion('capital')
        randomizeQuestion.then((question) => {
            question.question_id = question_id
            let game = {
                id: game_id,
                questions: [question],
                startGameCounter: 5,
                questionCounter: 20,
                roundEndCounter: 20,
                view: 1
            }
            startTimer(game)
            games.push(game)
            game_id++
            question_id++
            resolve(game)
        }).catch((error) => {
            console.log(error)
        })
    })
}

function generateGamerTag() {
    let gamertag = '',
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
        gamertag += chars.charAt(Math.floor(Math.random() * chars.length));
    }
   return gamertag
}

function getQuestion(type) {
    switch(type) {
        case 'capital':
            return getNationalCapitalsOfCountries()
        default: 
            throw('No question type defined')
    }
}

function startTimer(game) {
    let counter = setInterval(() => {
        let currentTime = updateGameTime(game)
        if(currentTime === 0) {
            updateGameViewIndex(game) // Maybe should put it somewhere else?
            clearInterval(counter)
            startTimer(game)
        }
    }, 1000)
} 

function updateGameViewIndex(game) {
    game.view++
    io.emit('update game view', game.view)
}

function getTimerProperty(view) {
    switch(view) {
        case 1: 
            return 'startGameCounter'
        case 2:
            return 'questionCounter'
        case 3:
            return 'roundEndCounter'
    }
}

function updateGameTime(game) {
    let timerProperty = getTimerProperty(game.view)
    game[timerProperty]--
    return game[timerProperty]
}

function getGame() {
    return new Promise((resolve, reject) => {
        resolve(!games.length ? createGame() : games[0])
    })
}

function submitAnswer(data) {
    let player = getPlayerByGametag(data.gamertag)
    if(player.constructor === Object) { // Player exists
        delete data.gamertag
        let existingAnswer = getAnswerByQuestionId(player.answers, data.question_id)
        if(existingAnswer.constructor === Object) {
            existingAnswer.answer = data.answer // Answer already exists, so we are going to update it
        } else {
            player.answers.push(data) // Create a new answer object
        }
    }
}

function getPlayerByGametag(gamertag) {
    let player = false
    players.forEach(p => {
        if(p.gamertag === gamertag) {
            player = p
        }
    })
    return player
}

function getAnswerByQuestionId(playersAnswers, question_id) {
    let answer = false
    playersAnswers.forEach(a => {
        if(a.question_id === question_id) {
            answer = a
        }
    })
    return answer
}

io.on("connection", (socket) => { 
    socket.on("join game", gamertag => {
        if(!gamertag.length) {
            gamertag = generateGamerTag()
            socket.emit('get gamertag', gamertag)
        }
        let gameFound = getGame()
        gameFound.then(game => {
            players.push({
                id: socket.id,  
                gamertag: gamertag,
                answers: [],
                points: 0
            })
            io.emit("send players", players)
            socket.emit("send game", game)
        })
    })
    socket.on("submit answer", data => submitAnswer(data))
    socket.on("get timer", viewIndex => {
        let timerProperty = getTimerProperty(viewIndex)
        socket.emit('send timer', {
            [timerProperty]: games[0][timerProperty]
        })
    })
    socket.on("get players", () => {
        socket.emit("send players", players)
    })
})
