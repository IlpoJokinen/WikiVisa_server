const Question = require("../../Question")

class Population extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("population")
        this.variants = [
            {
                "questionTitle": 'Which country has the smallest population',
                "answerTitle": 'The smallest population of # is in '
            },
            {
                "questionTitle": 'Which country has the biggest population',
                "answerTitle": 'The biggest population of # is in '
            },
            {
                "questionTitle": 'Which country has the population closest in size to #',
                "answerTitle": 'The population most similar in size to # is in  '
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

module.exports = Population