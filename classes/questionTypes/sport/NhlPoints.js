const Question = require("../../Question")

class NhlPoints extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("nhlPlayersPoints")
        this.variants = [
            {
                "questionTitle": "Who of these NHL players has scored the most points",
                "answerTitle": "With # points the most points has scored "
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
        this.setCorrectAnswer = this.setCorrectAnswerMaxOrMin(1)
    }
}

module.exports = NhlPoints