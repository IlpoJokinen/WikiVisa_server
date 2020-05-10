const Question = require("../../Question")

class LuokanNimi extends Question{
    constructor(){
        super()
        //tässä haetaan tähän kysymystyyppiin liittyvä data cachesta
        this.data = this.nodeCache.get("")
        this.variants = [
            {
                "questionTitle": "",
                "answerTitle": "",
                "attributesForDataSet": []
            },
            {
                "questionTitle": "",
                "answerTitle": "",
                "attributesForDataSet": []
            },
            {
                "questionTitle": "",
                "answerTitle": "",
                "attributesForDataSet": []
            },
            {
                "questionTitle": "",
                "answerTitle": "",
                "attributesForDataSet": []
            },
            {
                "questionTitle": "",
                "answerTitle": "",
                "attributesForDataSet": []
            }
         ]
        this.random = Math.floor(Math.random() * this.variants.length)
        //tämä funktio hoitaa datan muokkaamisen oikeanlaiseen muotoon kyseistä varianttia varten
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
    //tässä valitaan oikean vastauksen määrittävä funktio variantin mukaan
    chooseAnswerSetter() {
        this.setCorrectAnswer = [].includes(this.random) ? () => this.setCorrectAnswerRandom(1, 0) : () => this.setCorrectAnswerRandom(0, 1)
    }
    //tässä valitaan vastausvaihtoehdot määrittävä funktio variantin mukaan
    chooseChoiceFilterer() {
        this.choiceFilterer = this.random === 1 ? () => this.filterChoices(0) : () => this.filterChoices(1)
    }
}

module.exports = LuokanNimi