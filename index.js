require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const socket = require('socket.io')
const port = process.env.PORT || 3001
const utils = require('./Utilities')
const games = []
let game_id = 0
const { fetchFromDb } = require("./fetchFromDb")
const { fetchFromWikiData } = require("./fetchWikiData")
const { nodeCache } = require("./fetchFromDb")
app.use('/', express.static('./client'))
app.use('/reports', express.static('./reports'))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*')
    next()
})
app.get('/api/categories', (req, res) => {
    let categories = nodeCache.get("categories")
    res.send(categories)
})
startServer()
async function startServer() {
    try {
        await fetchFromDb()
        console.log('Done')
        await fetchFromWikiData()
        console.log('Done')
    } catch(err){
        console.log(err)
    }
    const server = app.listen(port, () => console.log(`WikiVisa app listening on port ${port}!`))
    app.use(cors())
    const io = socket(server)  
    const Game = require('./classes/Game')(io)

    function createGame(roomCode, properties) {
        properties.id = game_id
        properties.roomCode = roomCode.length ? roomCode : utils.generateRandomString(4)
        if(properties.type === "quick") {
            properties.question = {categories: nodeCache.get("categories")}
        } else {
            properties.question.categories = properties.question.hasOwnProperty('categories') && properties.question.categories.length 
            ? properties.question.categories.map(id => nodeCache.get("categories").find(category => id === category.id)) 
            : nodeCache.get("categories")
        }
        let game = new Game(properties)
        return new Promise((resolve, reject) => {
            game_id++
            resolve(game.get())
        })
    }

    function getGameByGameId(id) {
        return games.find(g => g.id === id)
    }

    function setReady(data) {
        let game = getGameByGameId(data.game_id)
        if(game){
            game.setAnswerAndPlayerReady(data)
        }
    }

    function setPlayerReadyLobby(data) {
        let game = getGameByGameId(data.game_id)
        if(game) {
            game.setPlayerReadyLobby(data.gamertag)
        }
    }

    function handleMessage(data) {
        let game = getGameByGameId(data.game_id)
        if(game){
            game.handleMessage(data)
        }
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

    Array.prototype.includesAll = function (arr) {
        let allFound = true
        arr.forEach(x => {
            allFound = this.includes(x)
        })
        return allFound
    }

    function getGamesByFilters(filters) {
        let filteredGames = games.filter(game => !game.started && game.visibility && game.currentPlayers < game.maxPlayers )
        filteredGames = filteredGames.filter(game => {
            return game.numberOfQuestions <= filters.maximumQuestionCount
        })
        filteredGames = filteredGames.filter(game => {
            return game.categories.map(category => category.id).includesAll(filters.selectedCategories)
        })
        return filteredGames.map(game => game.getAsFindGameItem())
    }

    io.on("connection", (socket) => { 

        socket.on('get games', filters => {
            socket.emit('send games', getGamesByFilters(filters))
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
                    pointsAdded: 0,
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
            if(game.maxPlayers <= game.currentPlayers) {
                socket.emit("error while joining", "Room is full, sorry!")
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
                pointsAdded: 0,
                ready: false,
                roomCode: game.roomCode
            })
            socket.emit("send game", game.gameWithoutCertainAttributes("correctAnswers", "questions"))
            io.in(game.roomCode).emit("send players", game.players)
        })
        socket.on("set ready", data => {
            setReady(data)
        })
        socket.on("start game", data => {
            startGame(data.game_id, socket.id)
        })
        socket.on("set lobby ready", data => {
            setPlayerReadyLobby(data)
        })
        socket.on("send lobby message", (data) => {
            handleMessage(data)
        })
    })
}

