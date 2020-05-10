const Question = require("../../Question")

class War extends Question{

    constructor(){
        super()
        this.data = this.nodeCache.get("data").history.war.data
        this.variants = this.nodeCache.get("data").history.war.variants
        
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
        this.setCorrectAnswer = this.random === 0 ? () => this.setCorrectAnswerMaxOrMin(1) : this.random === 4 ? () => this.setCorrectAnswerRandom(0, 1) : () => this.setCorrectAnswerRandom(1, 0) 
    }
    chooseChoiceFilterer() {
        this.choiceFilterer = [0, 4].includes(this.random) ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = War