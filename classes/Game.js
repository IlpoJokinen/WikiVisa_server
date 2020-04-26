const QuestionSet = require('./QuestionSet')
let categories = {
    Geoghraphy: ["area", "population", "officialLanguage", "capital"]
}

module.exports = (io) => class Game {

    constructor(properties) {
        this.id = properties.id
        this.gameCreator = properties.gameCreator
        this.started = false
        this.roomCode = properties.roomCode
        this.startGameCounter = 5
        this.defaults = {
            question: {
                categories: properties.question.categories.length ? properties.question.categories : categories.Geoghraphy,
                count: properties.question.count.length ? properties.question.count : 5,
            }, 
            counters: {
                questionCounter: properties.counters.answer.length ? properties.counters.answer : 10,
                roundEndCounter: properties.counters.roundEnd.length ? properties.counters.roundEnd : 10
            }, 
            visibility: properties.visibility,
            losePoints: properties.losePoints
        }
        this.questionCounter = this.defaults.counters.questionCounter
        this.roundEndCounter = this.defaults.counters.roundEndCounter
        this.numberOfQuestions= this.defaults.question.count
        this.visibility = this.defaults.visibility
        this.losePoints = this.defaults.losePoints
        this.categories =  this.defaults.question.categories
        this.questions = []
        this.currentQuestionIndex = 0
        this.view = 1
        this.players = []
        this.correctAnswers = []
        this.ready = false
        this.answerOrder = []
        this.init()
    }
    init() {
        this.getQuestions().then(questions => {
            questions.forEach(question => {
                this.setCorrectAnswer(question)
                delete question.answer
                this.questions.push(question)
            })
            this.ready = true
        })
    }

    startGame() {
        this.started = true
        this.startTimer()
    } 

    startTimer() {
        io.in(this.roomCode).emit("game started")
        let counter = setInterval(() => {
            let currentTime = this.updateGameTime()
            if(currentTime <= 0) {
                if(this.view === 3 && this.currentQuestionIndex != this.questions.length - 1) {
                    this.view = 2 
                    this.currentQuestionIndex++
                    this.resetTimers()
                } else {
                    this.view++    
                }
                this.updateGameViewIndexForClients()  
                clearInterval(counter)
                this.startTimer()
            } 
        }, 1000)
        if(this.view === 3){
            this.checkPointsOfTheRound()
            io.in(this.roomCode).emit("send players", this.players)
            let correctAnswer = this.getCorrectAnswer()
            io.in(this.roomCode).emit('get correct answer', correctAnswer)
        }
        if(this.view === 4){
            //this.removeGame(game)
        }
    }

    updateGameTime() {
        let timerProperty = this.getTimerProperty(this.view)
        this[timerProperty]--
        return this[timerProperty]
    }

    getTimerProperty(view) {
        switch(view) {
            case 1: 
                return 'startGameCounter'
            case 2:
                return 'questionCounter'
            case 3:
                return 'roundEndCounter'
        }
    }

    resetTimers() {
        this.questionCounter = this.defaults.counters.questionCounter
        this.roundEndCounter = this.defaults.counters.roundEndCounter
        io.in(this.roomCode).emit('reset timers', {questionCounter: this.questionCounter, roundEndCounter: this.roundEndCounter})
    }

    updateGameViewIndexForClients() {
        if(this.view === 2){
            this.sendNextQuestion()
        }

        io.in(this.roomCode).emit('update game view', this.view)
    }
    
    sendNextQuestion(){
        let nextQuestion = this.questions[this.currentQuestionIndex]
        io.in(this.roomCode).emit("send question", nextQuestion)
    }

    setCorrectAnswer(question) {
        this.correctAnswers.push({
            question_id: question.id,
            answer: {
                name: question.answer.name,
                value: question.answer.index,
                answerTitle: question.answer.answerTitle
            }
        })
    }
    getQuestions() {
        let questions = new QuestionSet([/*"sport", */"geography"/*, "history", "people"*/], this.numberOfQuestions)
        return questions.get()
    }
    
    checkPointsOfTheRound(){
        const correctAnswerOftheRound = this.getCorrectAnswer()
        this.players.map(p => {
            p.ready = false
            let answerOfThePlayer = this.getAnswerByQuestionId(p.answers, this.currentQuestionIndex)
            if(answerOfThePlayer && answerOfThePlayer.answer.value === correctAnswerOftheRound.value){
                let extraPoints = Math.abs(this.answerOrder.findIndex(obj => obj.gamertag === p.gamertag) - 5)
                if(extraPoints <= 5) {
                    p.points += 10 + extraPoints
                } else {
                    p.points += 10
                }
            } else {
                if(this.losePoints && p.points >= 5) {
                    p.points -= 5
                }
            }
        })
        this.answerOrder = []
    }

    getCorrectAnswer() {
        let currentQuestion = this.questions[this.currentQuestionIndex],
            answer = false
        this.correctAnswers.forEach(a => {
            if(a.question_id === currentQuestion.id) {
                answer = a.answer
            }
        })
        return answer
    }

    getAnswerByQuestionId(playersAnswers, question_id) {
        let answer = false
        playersAnswers.forEach(a => {
            if(a.question_id === question_id) {
                answer = a
            }
        })
        return answer
    }

    getGamesIndexInGames(game_id) {
        let index = false
        games.forEach((g, i) => {
            if(g.game_id === game_id) {
                index = i
            }
        })
        return index
    }
    getPlayerByGametag(gamertag) {
        let player = false
        this.players.forEach(p => {
            if(p.gamertag === gamertag) {
                player = p
            }
        })
        return player
    }

    addPlayer(player) {
        this.players.push(player)
    }

    checkIfAllPlayersReady() {
        return this.players.filter(p => p.ready).length === this.players.length
    }

    playersWithoutAnswers() {
        return this.players.map(p => ({ ...p, answers: [] }))
    }

    setAnswerAndPlayerReady(data) {
        let player = this.getPlayerByGametag(data.gamertag, data.roomCode)
        if(player.constructor === Object) {
            this.handleAnswerOrder(data)
            delete data.gamertag
            delete data.game_id
            player.answers.push(data)
            player.ready = true
            if(this.checkIfAllPlayersReady()){
                this.questionCounter = 0
            }
            const playersWithoutAnswers = this.playersWithoutAnswers()
            io.in(this.roomCode).emit("send players", playersWithoutAnswers)
        }
    }

    handleAnswerOrder(data) {
        let correctAnswerOfTheRound = this.getCorrectAnswer()
        if(correctAnswerOfTheRound.value === data.answer.value){
            this.answerOrder.push({gamertag: data.gamertag, time: data.time})
            this.answerOrder = this.answerOrder.sort((a, b) => a.time - b.time)
            this.answerOrder = this.answerOrder.slice(0, 5)
        }
    }

    setPlayerReadyLobby(gamertag) {
        let player = this.getPlayerByGametag(gamertag)
        player.lobbyReady = true
        console.log(this.players)
        io.in(this.roomCode).emit("send players", this.players)
    }

    gameWithoutCertainAttributes() {
        function jsonCopy(src) {
            return JSON.parse(JSON.stringify(src));
        }
        let copyOfThis = jsonCopy(this)
        for(let i = 0; i < arguments.length; i++){
            delete copyOfThis[arguments[i]]
        }
        return copyOfThis
    }

    getAsFindGameItem() {
        return {
            roomCode: this.roomCode,
            categories: this.categories,
            maxPlayers: 5,
            currentPlayers: 1,
        }
    }

    get() {
        return new Promise((res, rej) => {
            let counter = setInterval(() => {
                if(this.ready) {
                    clearInterval(counter)
                    res(this)
                }
            }, 100)
        })
    }
    
}
