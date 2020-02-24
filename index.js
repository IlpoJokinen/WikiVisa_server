const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const port = process.env.PORT || 3001
const { getNationalCapitalsOfCountries } = require("./capitalQuestion")
const games = []
const players = []
const correctAnswers = []
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
            correctAnswers.push({
                question_id: question.question_id,
                answer: {
                    name: question.answer.name,
                    value: question.answer.index
                }
            })
            delete question.answer
            let game = {
                id: game_id,
                startGameCounter: 15,
                questionCounter: 15,
                roundEndCounter: 15,
                questions: [question],
                currentQuestionIndex: 0, // refers to the currently shown question in array
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
    if(game.view === 3){
        io.emit('get correct answer', getCorrectAnswer(game))
    }
    if(game.view === 4){
        removeGame(game)
    }
} 

function getGamesIndexInGames(game_id) {
    let index = false
    games.forEach((g, i) => {
        if(g.game_id === game_id) {
            index = i
        }
    })
    return index
}

function removeGame(game){
    let gameIndex = getGamesIndexInGames(game.game_id)
    games.splice(gameIndex, 1)
}

function getCorrectAnswer(game) {
    let currentQuestion = game.questions[game.currentQuestionIndex],
        answer = false
    correctAnswers.forEach(q => {
        if(q.question_id === currentQuestion.question_id) {
            answer = q.answer
        }
    })
    return answer
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
    io.emit("send players", players)
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
