const {Question} = require('./Question')

module.exports = (io) => class Game {

    constructor(game_id, roomCode) {
        this.id = game_id
        this.roomCode = roomCode
        this.startGameCounter = 15
        this.questionCounter = 15
        this.roundEndCounter = 15
        this.questions = []
        this.currentQuestionIndex = 0
        this.view = 1
        this.players = []
        this.correctAnswers = []
        this.ready = false
        this.init()
    }

    init() {
        this.getQuestions(3).then(questions => {
            questions.forEach(question => {
                this.setCorrectAnswer(question)
                delete question.answer
            })
            this.questions = questions
            this.ready = true
        })
    }

    startGame() {
        this.startTimer()
    } 

    startTimer() {
        let counter = setInterval(() => {
            let currentTime = this.updateGameTime()
            if(currentTime <= 0) {
                if(this.view === 3 && this.currentQuestionIndex != this.questions.length - 1) {
                    this.view = 2
                    this.updateCurrentQuestionIndex()
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
            io.in(this.roomCode).emit("send game", this)
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
    
    updateCurrentQuestionIndex(){
        this.currentQuestionIndex++
        io.in(this.roomCode).emit('update question index', this.currentQuestionIndex)
    }

    resetTimers() {
        //jos tässä muuttaa esim roundEndCounteria niin tulee errorii frontin puolella, en tajuu. Se toimii vaan jos siinä on sama luku kuin konstruktoriin on laitettu
        this.questionCounter = 15
        this.roundEndCounter = 15
        io.in(this.roomCode).emit('reset timers', {questionCounter: this.questionCounter, roundEndCounter: this.roundEndCounter})
    }

    updateGameViewIndexForClients() {
        io.in(this.roomCode).emit('update game view', this.view)
    }
    
    setCorrectAnswer(question) {
        this.correctAnswers.push({
            question_id: question.id,
            answer: {
                name: question.answer.name,
                value: question.answer.index
            }
        })
    }
    getQuestions(numberOfQuestions) {
        let promises = []
        for(let i = 0; i < numberOfQuestions; i++) {
            let question = new Question(i, 'capital')
            promises.push(question.get())
        }
        return Promise.all(promises)
    }

    checkPointsOfTheRound(){
        const correctAnswerOftheRound = this.getCorrectAnswer()
        this.players.map(p => {
            p.ready = false
            let answerOfThePlayer = this.getAnswerByQuestionId(p.answers, this.currentQuestionIndex)
            if(answerOfThePlayer && answerOfThePlayer.answer.value === correctAnswerOftheRound.value){
                p.points += 10
            }
        })
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

    submitAnswer(data) {
        let player = this.getPlayerByGametag(data.gamertag)
        if(player.constructor === Object) { // Player exists
            delete data.gamertag
            delete data.game_id
            let existingAnswer = this.getAnswerByQuestionId(player.answers, data.question_id)
            if(existingAnswer.constructor === Object) {
                existingAnswer.answer = data.answer // Answer already exists, so we are going to update it
            } else {
                player.answers.push(data) // Create a new answer object
            }
        }
    }

    checkIfAllPlayersReady(players) {
        let num = 0
        players.forEach(p => {
            if(p.ready == true){
                num++
            }
        })
        return num === players.length
    }

    playersWithoutAnswers() {
        return this.players.map(p => ({ ...p, answers: [] }))
    }

    setPlayerReady(data) {
        let player = this.getPlayerByGametag(data.gamertag, data.roomCode)
        if(player.constructor === Object) { 
            player.ready = true
            if(this.checkIfAllPlayersReady(this.players)){
                this.questionCounter = 0
            }
            const playersWithoutAnswers = this.playersWithoutAnswers()
            io.in(this.roomCode).emit("send players", playersWithoutAnswers)
        }
    }
    
    /*removeUnusedAttributes() {
        delete this.options
        delete this.filteredData
    }*/
    get() {
        return new Promise((res, rej) => {
            let counter = setInterval(() => {
                if(this.ready) {
                    clearInterval(counter)
                  //  this.removeUnusedAttributes()
                    res(this)
                }
            }, 100)
        })
    }
    
}
