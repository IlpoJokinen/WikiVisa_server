const Question = require("../../Question")

class NhlPoints extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("data").sport.nhlPoints.data
        this.variants = this.nodeCache.get("data").sport.nhlPoints.variants

        this.random = Math.floor(Math.random() * this.variants.length)
        this.reconstructDataSetForTheVariant()
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
        this.setCorrectAnswer = () => this.setCorrectAnswerMaxOrMin(1)
    }
}

module.exports = NhlPoints