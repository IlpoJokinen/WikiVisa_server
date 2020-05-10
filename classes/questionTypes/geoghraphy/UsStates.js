const Question = require("../../Question")

class UsStates extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("data").geography.usStates.data
        this.variants = this.nodeCache.get("data").geography.usStates.variants

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
        this.setCorrectAnswer = this.random === 0 ? () => this.setCorrectAnswerMaxOrMin(1) : this.random === 1 ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }

    chooseChoiceFilterer() {
        this.choiceFilterer = [0, 2].includes(this.random) ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = UsStates