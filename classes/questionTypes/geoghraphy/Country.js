const Question = require("../../Question")

class Country extends Question{
    
    constructor(){
        super()
        this.data = this.nodeCache.get("data").geography.country.data
        this.variants = this.nodeCache.get("data").geography.country.variants
        
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
        if(this.random === 1) {
            this.setCorrectAnswer = () => this.setCorrectAnswerRandom(0, 1)
        } else if([0, 8].includes(this.random)) {
            this.setCorrectAnswer = () => this.setCorrectAnswerRandom(1, 0)
        } else if ([2, 5].includes(this.random)){
            this.setCorrectAnswer = () => this.setCorrectAnswerMaxOrMin(0)
        } else if ([3, 6].includes(this.random)){
            this.setCorrectAnswer = () => this.setCorrectAnswerMaxOrMin(1)
        } else if ([4, 7].includes(this.random)) {
            this.setCorrectAnswer = () => this.setCorrectAnswerNearest()
        }
    }
    chooseChoiceFilterer() {
        this.choiceFilterer = [0, 8].includes(this.random) ? () => this.filterChoices(1) : () => this.filterChoices(0)
    }
}

module.exports = Country