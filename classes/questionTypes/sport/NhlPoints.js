const Question = require("../../Question")

class NhlPoints extends Question{
    //[{0: nimi, 1: pisteet, 2: maalit, 3: syötöt}] nodeCachessa oleva setti
    constructor(){
        super()
        this.data = this.nodeCache.get("nhlPoints")
        this.variants = [
            {
                "questionTitle": "Who of these NHL players has scored the most points",
                "answerTitle": "With # points the most points has scored ",
                "attributesForDataSet": [0, 1]
            },
            {
                "questionTitle": "Who of these NHL players has scored the most goals",
                "answerTitle": "With # goals the most goals has scored ",
                "attributesForDataSet": [0, 2]
            },
            {
                "questionTitle": "Who of these NHL players has the most assists recorded",
                "answerTitle": "With # assists the most assists has recorded ",
                "attributesForDataSet": [0, 3]
            }
         ]
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