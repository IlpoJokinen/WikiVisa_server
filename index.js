const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();

const port = process.env.PORT || 3001
const { getNationalCapitalsOfCountries } = require("./capitalQuestion")
const User = require('./models/Test_Schema')
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

connectToMongo()

async function connectToMongo() {
    const uri = await getUri()
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
}
async function getUri(){
    const uri = await mongod.getUri()
    return uri
}
app.get("/api", async (req, res) => {
    const userFromDb = await User.find({})
    res.json({userFromDb})
})

function createGame(roomCode) {
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
                startGameCounter: 100,
                questionCounter: 100,
                roundEndCounter: 100,
                questions: [question],
                currentQuestionIndex: 0, // refers to the currently shown question in array
                view: 1,
                roomCode: roomCode.length ? roomCode : generateRandomString(4)
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

function generateRandomString(n) {
    let string = '',
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < n; i++) {
        string += chars.charAt(Math.floor(Math.random() * chars.length));
    }
   return string
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
        checkPointsOfTheRound(game)
        io.in(game.roomCode).emit("send players", players)
        io.in(game.roomCode).emit('get correct answer', getCorrectAnswer(game))
    }
    if(game.view === 4){
        removeGame(game)
    }
} 

function checkPointsOfTheRound(game){
    const correctAnswerOftheRound = getCorrectAnswer(game)
    players.map(p => {
        p.ready = false
        let answerOfThePlayer = getAnswerByQuestionId(p.answers, game.currentQuestionIndex)
        if(answerOfThePlayer && answerOfThePlayer.answer.value === correctAnswerOftheRound.value){
            p.points += 10
        }
    })
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
    io.in(game.roomCode).emit('update game view', game.view)
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


function getGame(roomCode) {
    return new Promise((resolve, reject) => {
        let game = games.find(g => g.roomCode === roomCode)
        if (game === undefined) {
            reject({
                errorId: 1,
                message: "this room code wasn't found"
            })
        } else {
            resolve(game)
        }
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
   // io.emit("send players", players) 
}

function setReady(data) {
    let player = getPlayerByGametag(data.gamertag)
    if(player.constructor === Object) { 
        player.ready = true
    }
    io.in(player.roomCode).emit("send players", players)
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

function addPlayer(player) {
    players.push(player)
}
io.on("connection", (socket) => { 
    socket.on('create game', data => {
        if(data.gamertag.length) {
            let player = getPlayerByGametag(data.gamertag)
            if(player.constructor === Object) {
                socket.emit('gamertag taken', data.gamertag)
                return false
            }
        } else {
            gamertag = generateRandomString(10)
            socket.emit('get gamertag', gamertag)
        }
        let creatingGame = createGame(data.roomCode)
        creatingGame.then(game => {
            socket.join(game.roomCode)
            addPlayer({
                id: socket.id,  
                gamertag: data.gamertag,
                answers: [],
                points: 0,
                ready: false,
                roomCode: game.roomCode
            })
            socket.emit("send players", players)
            socket.emit("send game", game)
        })
    })
    socket.on("join game", data => {
        if(data.gamertag.length) {
            let player = getPlayerByGametag(data.gamertag)
            if(player.constructor === Object) {
                socket.emit('gamertag taken', data.gamertag)
                return false
            }
        } else {
            gamertag = generateRandomString(10)
            socket.emit('get gamertag', gamertag)
        }
        let gameFound = getGame(data.roomCode)
        gameFound.then(game => {
            socket.join(game.roomCode)
            addPlayer({
                id: socket.id,  
                gamertag: data.gamertag,
                answers: [],
                points: 0,
                ready: false,
                roomCode: game.roomCode
            })
            io.in(game.roomCode).emit("send players", players)
            socket.emit("send game", game)
        }).catch(error => {
            if(error.errorId === 1){
                socket.emit("roomcode not found", error.message)
            }
        })
    })
    socket.on("submit answer", data => submitAnswer(data))
    socket.on("set ready", data => setReady(data))
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
