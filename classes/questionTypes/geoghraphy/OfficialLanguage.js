const Question = require("../../Question")

class OfficialLanguage extends Question {
    
    constructor(){
        super()
        this.data = this.nodeCache.get("data").geography.officialLanguage.data
        this.variants = this.nodeCache.get("data").geography.officialLanguage.variants
       
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
        this.controlThatOnlyOneCorrectAnswer(this.random === 0 ? 1 : 0)
    }

    chooseAnswerSetter() {
        this.setCorrectAnswer = this.random === 0 ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }

    chooseChoiceFilterer() {
        this.choiceFilterer = this.random === 0 ? () => this.filterChoices(1) : () => this.filterChoices(0)
    }
}

module.exports = OfficialLanguage