const {Question} = require('./Question')

class Game {

    constructor(game_id, roomCode) {
        this.id = game_id
        this.roomCode = roomCode
        this.startGameCounter = 10
        this.questionCounter = 8
        this.roundEndCounter = 5
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
module.exports = {Game}