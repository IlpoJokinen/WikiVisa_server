const Question = require("../../Question")

class WinterOlympicYear extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("winterOlympicYear")
        this.variants = [
            {
                "questionTitle": "In which country was held #",
                "answerTitle": "# were held in "
            }
        ]
        this.random = Math.floor(Math.random() * this.variants.length)
        this.chooseAnswerSetter()
        this.setChoices()
        this.removeUnusedAttributes()
    }

    setChoices() {
        this.randomizedItems = this.getRandomItems(4)
        this.choices = this.filterChoices(1)
        this.setCorrectAnswer()
    }

    chooseAnswerSetter() {
        this.setCorrectAnswer = () => this.setCorrectAnswerRandom(1, 0)
    }
}

module.exports = WinterOlympicYear