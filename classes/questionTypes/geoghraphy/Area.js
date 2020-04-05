const Question = require("../../Question")

class Area extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("area")
        this.variants = [
            {
                "questionTitle": 'Which country is the smallest by area',
                "answerTitle": 'The smallest country with an area of # km² is '
            },
            {
                "questionTitle": 'Which country is the biggest by area',
                "answerTitle": 'The biggest country with an area of # km² is '
            },
            {
                "questionTitle": 'Which country is the closest in size to #',
                "answerTitle": 'The closest country in size to # is '
            }
        ]
        this.random = Math.floor(Math.random() * this.variants.length)
        this.chooseAnswerSetter()
        this.setChoices()
        this.removeUnusedAttributes()
    }

    setChoices() {
        this.randomizedItems = this.getRandomItems(4)
        this.choices = this.filterChoices(0)
        this.setCorrectAnswer()
    }

    chooseAnswerSetter() {
        this.setCorrectAnswer = this.random <= 1 ? () => this.setCorrectAnswerMaxOrMin() : () => this.setCorrectAnswerNearest()
    }
}

module.exports = Area