const Question = require("../../Question")

class LiteratureNobelist extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("data").people.literatureNobelist.data
        this.variants = this.nodeCache.get("data").people.literatureNobelist.variants

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
        this.setCorrectAnswer = [0, 2, ,3, 4].includes(this.random) ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }
    chooseChoiceFilterer() {
        this.choiceFilterer = this.random === 1 ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = LiteratureNobelist