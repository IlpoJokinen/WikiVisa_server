const Question = require("../../Question")

class WinterOlympicYear extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("data").sport.winterOlympicYear.data
        this.variants = this.nodeCache.get("data").sport.winterOlympicYear.variants
       
        this.random = Math.floor(Math.random() * this.variants.length)
        this.reconstructDataSetForTheVariant()
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