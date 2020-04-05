const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const port = process.env.PORT || 3001
const utils = require('./Utilities')
const games = []
let game_id = 0

app.use(express.static('./build'))
app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port, () => console.log(`WikiVisa app listening on port ${port}!`))
const io = socket(server)
const Game = require('./classes/Game')(io)

app.use(cors())

function createGame(roomCode, properties) {
    properties.id = game_id
    properties.roomCode = roomCode.length ? roomCode : utils.generateRandomString(4)
    let game = new Game(properties)
    return new Promise((resolve, reject) => {
        game_id++
        resolve(game.get())
    })
}

//tästä en tiiä
function removeGame(game){
    let gameIndex = getGamesIndexInGames(game.game_id)
    games.splice(gameIndex, 1)
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

function startGame(game_id, socket_id){
    const game = getGameByGameId(game_id)
    if(game !== undefined && game.gameCreator === socket_id) {
        game.startGame()
    }
    return false
}

function getPublicGames() {
    const publicGames = []
    games.forEach(game => {
        if(game.visibility && !game.started) {
            publicGames.push(game.getAsFindGameItem())
        }
    })
    return publicGames
}

io.on("connection", (socket) => { 

    socket.on('get public games', () => {
        socket.emit('send public games', getPublicGames())
    })

    socket.on('create game', data => {
        if(!data.gamertag.length) {
            data.gamertag = utils.generateRandomString(10)
            socket.emit('send gamertag', data.gamertag)
        }
        data.gameProperties.gameCreator = socket.id
        let creatingGame = createGame(data.roomCode, data.gameProperties)
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
            socket.emit("send game", {...game.gameWithoutCertainAttributes("correctAnswers", "questions"), creator: true})
        })
    })

    socket.on("join game", data => {
        if(!roomCodeExists(data.roomCode)) {
            socket.emit("error while joining", "We couldn't find the game you were looking for. Check the room code for spelling mistakes!")
            return false
        }
        let game = getGameByRoomCode(data.roomCode)
        if(game.started){
            socket.emit("error while joining", "Bollocks! Game has already started. Provide another room code!")
            return false
        }
        //verrataan gamertagia huoneen muiden pelaajien tageihin 
        if(data.gamertag.length) {
            let players = game.players
            if(players.some(p => p.gamertag === data.gamertag)) {
                socket.emit('gamertag taken', data.gamertag)
                return false
            }
        } else {
            data.gamertag = utils.generateRandomString(10)
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
        socket.emit("send game", game.gameWithoutCertainAttributes("correctAnswers", "questions"))
        io.in(game.roomCode).emit("send players", game.players)
    })
    socket.on("submit answer", data => submitAnswer(data))
    socket.on("set ready", data => setReady(data))
    socket.on("start game", data => {
        startGame(data.game_id, socket.id)
    })
})

