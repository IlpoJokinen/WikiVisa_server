const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer()
const port = process.env.PORT || 3001
const User = require('./models/Test_Schema')
const games = []
let game_id = 0

app.use(express.static('./client/build'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`WikiVisa app listening on port ${port}!`))
const io = socket(server)
const Game = require('./classes/Game')(io)

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
    roomCode = roomCode.length ? roomCode : generateRandomString(4)
    let game = new Game(game_id, roomCode)
    game_id++
    
    return new Promise((resolve, reject) => {
            resolve(game.get())
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

//tästä en tiiä
function removeGame(game){
    let gameIndex = getGamesIndexInGames(game.game_id)
    games.splice(gameIndex, 1)
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

function getGameByGameId(id) {
    return games.find(g => g.id === id)
}

function submitAnswer(data) {
    let game = getGameByGameId(data.game_id)
    game.submitAnswer(data)
}

function setReady(data) {
    let game = getGameByGameId(data.game_id)
    game.setPlayerReady(data)
}

function roomCodeExists(roomCode) {
    return games.some(g => g.roomCode === roomCode)
}

function getGameByRoomCode(roomCode){
    return games.find(g => g.roomCode === roomCode)
}

io.on("connection", (socket) => { 
    socket.on('create game', data => {
        if(!data.gamertag.length) {
            data.gamertag = generateRandomString(10)
            socket.emit('send gamertag', data.gamertag)
        }
        let creatingGame = createGame(data.roomCode)
        creatingGame.then(game => {
            games.push(game)
            socket.join(game.roomCode)
            game.addPlayer({
                id: socket.id,  
                gamertag: data.gamertag,
                answers: [],
                points: 0,
                ready: false,
                roomCode: game.roomCode
            })
            game.startGame()
            socket.emit("send game", game.gameWithoutCorrectAnswers())
        })
    })

    //eikös tämän join gamen vois nyt rakentaa ihan ilman promisejakin kun se peli 
    //on pakostakin joko luotu tai sitten sitä ei ole eikä luoda vaan kysytään käyttäjältä uuttaa roomCodea
    socket.on("join game", data => {
        if(!roomCodeExists(data.roomCode)) {
            socket.emit("roomcode not found", "Provide another roomcode, the one you gave doesn't exit")
            return false
        }
        let game = getGameByRoomCode(data.roomCode)
        //verrataan gamertagia huoneen muiden pelaajien tageihin 
        if(data.gamertag.length) {
            let players = game.players
            if(players.some(p => p.gamertag === data.gamertag)) {
                socket.emit('gamertag taken', data.gamertag)
                return false
            }
        } else {
            data.gamertag = generateRandomString(10)
            socket.emit('send gamertag', data.gamertag)
        }
        socket.join(game.roomCode)
        game.addPlayer({
            id: socket.id,  
            gamertag: data.gamertag,
            answers: [],
            points: 0,
            ready: false,
            roomCode: game.roomCode
        })
        socket.emit("send game", game.gameWithoutCorrectAnswers())
        io.in(game.roomCode).emit("send players", game.players)
        /*
        let gameFound = getGame(data.roomCode)
        gameFound.then(game => {
            socket.join(game.roomCode)
            game.addPlayer({
                id: socket.id,  
                gamertag: data.gamertag,
                answers: [],
                points: 0,
                ready: false,
                roomCode: game.roomCode
            })
            //tässä lähetetään kaikille huoneen tyypeille peli olio, jossa nyt myös pelaajat sisällä
            socket.emit("send game", game)
            io.in(game.roomCode).emit("send players", game.players)
        }).catch(error => {
            if(error.errorId === 1){
                socket.emit("roomcode not found", error.message)
            }
        })*/
    })
    socket.on("submit answer", data => submitAnswer(data))
    socket.on("set ready", data => setReady(data))
    socket.on("get timer", data => {
        console.log("here",data.game_id)
        let game = getGameByGameId(data.game_id)
        let timerProperty = game.getTimerProperty(data.viewIndex)
        socket.emit('send timer', {
            [timerProperty]: game[timerProperty]
        })
    })
})

