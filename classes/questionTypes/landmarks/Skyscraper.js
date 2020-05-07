const Question = require("../../Question")

class SkyScraper extends Question{
    constructor(){
        super()
        this.data = this.nodeCache.get("data").landmarks.skyscraper.data
        this.variants = this.nodeCache.get("data").landmarks.skyscraper.variants
        this.random = Math.floor(Math.random() * this.variants.length)

        this.reconstructDataSetForTheVariant()
        this.chooseAnswerSetter()
        this.chooseChoiceFilterer()
        this.setChoices()
        this.removeUnusedAttributes()
    }

    setChoices() {
        this.randomizedItems = this.getRandomItems(4)
        this.choices = this.choiceFilterer()
        this.setCorrectAnswer()
    }

    chooseAnswerSetter() {
        this.setCorrectAnswer = this.random === 1 ? () => this.setCorrectAnswerMaxOrMin(1) : () => this.setCorrectAnswerRandom(1, 0)
    }

    chooseChoiceFilterer() {
        this.choiceFilterer = this.random === 1 ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = SkyScraper