const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer()
const port = process.env.PORT || 3001
const { getNationalCapitalsOfCountries } = require("./capitalQuestion")
const User = require('./models/Test_Schema')
const Question = require('./classes/Question')
const games = []
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

function getQuestions(numberOfQuestions) {
    let promises = []
    for(let i = 0; i < numberOfQuestions; i++) {
        let question = new Question.Question('capital')
        promises.push(question.get())
    }
    return Promise.all(promises)
}

function createGame(roomCode) {
    let game = {
        id: game_id,
        startGameCounter: 10,
        questionCounter: 8,
        roundEndCounter: 5,
        questions: [],
        currentQuestionIndex: 0, // refers to the currently shown question in array
        view: 1,
        players: [],
        roomCode: roomCode.length ? roomCode : generateRandomString(4)
    }
    return new Promise((resolve, reject) => {
        let gettingQuestions = getQuestions(4) // 3 refers to number of questions to create
        gettingQuestions.then(questions => {
            questions.forEach(q => {
                q.question_id = question_id
                correctAnswers.push({
                    question_id: q.question_id,
                    answer: {
                        name: q.answer.name,
                        value: q.answer.index
                    }
                })
                delete q.answer
                question_id++
            })
            game.questions = questions
            games.push(game)
            game_id++
            startGame(game)
            resolve(game)
        })
    })
}

function checkIfAllPlayersReady(players) {
    let num = 0
    players.forEach(p => {
        if(p.ready == true){
            num++
        }
    })
    return num === players.length
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

function resetTimers(game) {
    game.questionCounter = 8
    game.roundEndCounter = 5
    io.in(game.roomCode).emit('reset timers', {questionCounter: game.questionCounter, roundEndCounter: game.roundEndCounter})
}

function startTimer(game) {
    let counter = setInterval(() => {
        let currentTime = updateGameTime(game)
        if(currentTime <= 0) {
            if(game.view === 3 && game.currentQuestionIndex != game.questions.length - 1) {
                game.view = 2
                updateCurrentQuestionIndex(game)
                resetTimers(game)
            } else {
                game.view++    
            }
            updateGameViewIndex(game)  
            clearInterval(counter)
            startTimer(game)
        } 
    }, 1000)
    if(game.view === 3){
        checkPointsOfTheRound(game)
        io.in(game.roomCode).emit("send game", game)
        io.in(game.roomCode).emit('get correct answer', getCorrectAnswer(game))
    }
    if(game.view === 4){
        removeGame(game)
    }
}

function updateCurrentQuestionIndex(game){
    game.currentQuestionIndex++
    io.in(game.roomCode).emit('update question index', game.currentQuestionIndex)
}

function startGame(game) {
    startTimer(game)
} 

function checkPointsOfTheRound(game){
    const correctAnswerOftheRound = getCorrectAnswer(game)
    let players = getPlayersOfTheRoom(game.roomCode)
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

function getGameByGameId(game_id) {
    return games.find(g => g.id === game_id)
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
                message: `Room by the code ${roomCode} doesn't exist`
            })
        } else {
            resolve(game)
        }
    })
}

function submitAnswer(data) {
    let player = getPlayerByGametag(data.gamertag, data.roomCode)
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
    let player = getPlayerByGametag(data.gamertag, data.roomCode)
    let game = games.find(g => g.roomCode === data.roomCode)
    if(player.constructor === Object && roomCodeExists(data.roomCode)) { 
        player.ready = true
        if(checkIfAllPlayersReady(game.players)){
            game.questionCounter = 0
        }
        io.in(game.roomCode).emit("send players", game.players)
    }
}

function getPlayerByGametag(gamertag, roomCode) {
    let player = false
    let players = getPlayersOfTheRoom(roomCode)
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

function getPlayersOfTheRoom (roomCode) {
    const game = games.find(g => g.roomCode === roomCode)
    return game.players
}

function roomCodeExists(roomCode) {
    return games.some(g => g.roomCode === roomCode)
}

function addPlayer(player, roomCode) {
    games.find(g => g.roomCode === roomCode).players.push(player)
}

io.on("connection", (socket) => { 
    socket.on('create game', data => {
        if(!data.gamertag.length) {
            data.gamertag = generateRandomString(10)
            socket.emit('send gamertag', data.gamertag)
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
            }, data.roomCode)
            io.in(game.roomCode).emit("send game", game)
        })
    })
    socket.on("join game", data => {
        if(!roomCodeExists(data.roomCode)) {
            socket.emit("roomcode not found", "Provide another roomcode, the one you gave doesn't exit")
            return false
        }
        //verrataan gamertagia huoneen muiden pelaajien tageihin 
        if(data.gamertag.length) {
            let players = getPlayersOfTheRoom(data.roomCode)
            if(players.some(p => p.gamertag === data.gamertag)) {
                socket.emit('gamertag taken', data.gamertag)
                return false
            }
        } else {
            data.gamertag = generateRandomString(10)
            socket.emit('send gamertag', data.gamertag)
        }
        let gameFound = getGame(data.roomCode)
        gameFound.then(game => {
            socket.join(game.roomCode)
            //tähän myös paraetriksi funkkariin se roomCode että mihin peliin pelaaja liitetään
            addPlayer({
                id: socket.id,  
                gamertag: data.gamertag,
                answers: [],
                points: 0,
                ready: false,
                roomCode: game.roomCode
            }, data.roomCode)
            //tässä lähetetään kaikille huoneen tyypeille peli olio, jossa nyt myös pelaajat sisällä
            socket.emit("send game", game)
            io.in(game.roomCode).emit("send players", game.players)
            //socket.emit("send game", game)
        }).catch(error => {
            if(error.errorId === 1){
                socket.emit("roomcode not found", error.message)
            }
        })
    })
    socket.on("submit answer", data => submitAnswer(data))
    socket.on("set ready", data => setReady(data))
    socket.on("get timer", data => {
        let game = getGameByGameId(data.game_id)
        let timerProperty = getTimerProperty(data.viewIndex)
        socket.emit('send timer', {
            [timerProperty]: game[timerProperty]
        })
    })
    //tätä ei tulla enää sitten tarvitsemaan
    socket.on("get players", () => {
        socket.emit("send players", players)
    })
})
